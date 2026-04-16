import { useState, useEffect, useCallback } from 'react';
import { Button, Loader, Alert, Group, Title, Pagination, TextInput, Select, Stack } from '@mantine/core';
import CategoryList from '../components/Category/CategoryList';
import CategoryForm from '../components/Category/CategoryForm';
import CategoryDeleteConfirm from '../components/Category/CategoryDeleteConfirm';

import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';
import { parseLinkHeader, pageFromLink, readApiError } from '../utils/http';

const PAGE_LIMIT = 9;

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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');

  const token = getAuthToken();
  const isLoggedIn = Boolean(token);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        search,
        sort,
      });

      const response = await fetch(buildApiUrl(`/categories?${params.toString()}`));

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
  }, [page, search, sort]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const requireAuth = () => {
    if (isLoggedIn) {
      return true;
    }

    setError('Please log in to manage categories.');
    return false;
  };

  const handleCreateCategory = async (categoryData) => {
    if (!requireAuth()) return;

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
    if (!requireAuth()) return;

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
    if (!requireAuth()) return;

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
        {isLoggedIn ? (
          <Button onClick={() => { setIsUpdateMode(false); setSelectedCategory(null); setModalOpened(true); }}>Create Category</Button>
        ) : null}
      </Group>

      {error ? <Alert color="red">{error}</Alert> : null}

      <Group align="end" wrap="wrap">
        <TextInput
          placeholder="Search by name"
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
        />
        <Button onClick={() => { setSearch(searchInput.trim()); setPage(1); }}>
          Search
        </Button>
        <Select
          label="Sort"
          value={sort}
          data={[
            { value: 'name_asc', label: 'Name ascending' },
            { value: 'name_desc', label: 'Name descending' },
          ]}
          onChange={(value) => {
            setSort(value || 'name_asc');
            setPage(1);
          }}
        />
      </Group>

      <CategoryList
        categories={categories}
        onEdit={(category) => { setIsUpdateMode(true); setSelectedCategory(category); setModalOpened(true); }}
        onDelete={(category) => { setSelectedCategory(category); setDeleteDialogOpened(true); }}
        isLoggedIn={isLoggedIn}
      />

      <Group justify="center">
        <Pagination value={page} onChange={setPage} total={totalPages} withEdges />
      </Group>

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
