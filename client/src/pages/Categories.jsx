import React, { useState, useEffect } from 'react';
import { Button, Loader, Alert, Group, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import CategoryList from '../components/Category/CategoryList';
import CategoryForm from '../components/Category/CategoryForm';
import CategoryDeleteConfirm from '../components/Category/CategoryDeleteConfirm';

import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();
  const token = getAuthToken();
  const isLoggedIn = !!token;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/categories'));

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/categories'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create category: ${response.status}`);
      }

      setModalOpened(false);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    if (!isLoggedIn || !selectedCategory) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/categories/${selectedCategory._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update category: ${response.status}`);
      }

      setModalOpened(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    if (!isLoggedIn || !selectedCategory) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/categories/${selectedCategory._id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete category: ${response.status}`);
      }

      setDeleteDialogOpened(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const openCreateModal = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsUpdateMode(false);
    setSelectedCategory(null);
    setModalOpened(true);
  };

  const openUpdateModal = (category) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsUpdateMode(true);
    setSelectedCategory(category);
    setModalOpened(true);
  };

  const openDeleteDialog = (category) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setSelectedCategory(category);
    setDeleteDialogOpened(true);
  };

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Categories</Title>
        </div>

        <Button onClick={openCreateModal}>Create Category</Button>
      </Group>

      <CategoryList
        categories={categories}
        onEdit={openUpdateModal}
        onDelete={openDeleteDialog}
        isLoggedIn={isLoggedIn}
      />

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
    </div>
  );
}

export default Categories;