import { useState, useEffect, useCallback } from 'react';
import { Button, Loader, Alert, Group, Title, Pagination, TextInput, Select, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import CategoryList from '../components/Category/CategoryList';
import CategoryForm from '../components/Category/CategoryForm';
import CategoryDeleteConfirm from '../components/Category/CategoryDeleteConfirm';

import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';
import { parseLinkHeader, pageFromLink, readApiError } from '../utils/http';

const PAGE_LIMIT = 10;

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const navigate = useNavigate();
  const token = getAuthToken();

  const fetchCategories = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        search,
        sortBy: 'name',
        sortOrder,
      });

      const response = await fetch(buildApiUrl(`/categories?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, `Failed to fetch categories: ${response.status}`));
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);

      const links = parseLinkHeader(response.headers.get('Link'));
      setTotalPages(pageFromLink(links.last) || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [navigate, page, search, sortOrder, token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async (categoryData) => {
    const response = await fetch(buildApiUrl('/categories'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, `Failed to create category: ${response.status}`));
    }

    setModalOpened(false);
    setPage(1);
    await fetchCategories();
  };

  const handleUpdateCategory = async (categoryData) => {
    const response = await fetch(buildApiUrl(`/categories/${selectedCategory._id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, `Failed to update category: ${response.status}`));
    }

    setModalOpened(false);
    setSelectedCategory(null);
    await fetchCategories();
  };

  const handleDeleteCategory = async () => {
    const response = await fetch(buildApiUrl(`/categories/${selectedCategory._id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setError(await readApiError(response, `Failed to delete category: ${response.status}`));
      return;
    }

    setDeleteDialogOpened(false);
    setSelectedCategory(null);
    await fetchCategories();
  };

  if (loading) return <Loader />;

  return (
    <Stack>
      <Group justify="space-between" mb="md">
        <Title order={2}>Categories</Title>
        <Button onClick={() => { setIsUpdateMode(false); setSelectedCategory(null); setModalOpened(true); }}>Create Category</Button>
      </Group>

      {error ? <Alert color="red">{error}</Alert> : null}

      <Group>
        <TextInput
          placeholder="Search by name"
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
        />
        <Select
          label="Sort"
          value={sortOrder}
          data={[
            { value: 'asc', label: 'Name A-Z' },
            { value: 'desc', label: 'Name Z-A' },
          ]}
          onChange={(value) => {
            setSortOrder(value || 'asc');
            setPage(1);
          }}
        />
      </Group>

      <CategoryList
        categories={categories}
        onEdit={(category) => { setIsUpdateMode(true); setSelectedCategory(category); setModalOpened(true); }}
        onDelete={(category) => { setSelectedCategory(category); setDeleteDialogOpened(true); }}
        isLoggedIn
      />

      <Pagination value={page} onChange={setPage} total={totalPages} withEdges />

      <CategoryForm
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        isUpdateMode={isUpdateMode}
        selectedCategory={selectedCategory}
        onCreate={handleCreateCategory}
        onUpdate={handleUpdateCategory}
      />

      <CategoryDeleteConfirm
        opened={deleteDialogOpened}
        onClose={() => setDeleteDialogOpened(false)}
        onConfirm={handleDeleteCategory}
      />
    </Stack>
  );
}

export default Categories;
