// CategoryManagement.js
import React, { useState, useEffect } from 'react';
import { Button, Loader, Alert, Modal, Group } from '@mantine/core';
import CategoryList from '../components/Category/CategoryList';
import CategoryForm from '../components/Category/CategoryForm';
import CategoryDeleteConfirm from '../components/Category/CategoryDeleteConfirm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const token = localStorage.getItem('jwt');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setLoading(false);
      return;
    }
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData),
    });

    if (response.ok) fetchCategories();
  };

  const handleUpdateCategory = async (categoryData) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setLoading(false);
      return;
    }
    const response = await fetch(`${API_BASE_URL}/categories/${selectedCategory._id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData),
    });

    if (response.ok) fetchCategories();
  };

  const handleDeleteCategory = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setLoading(false);
      return;
    }
    const response = await fetch(`${API_BASE_URL}/categories/${selectedCategory._id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.ok) fetchCategories();
  };

  const openCreateModal = () => {
    setIsUpdateMode(false);
    setModalOpened(true);
  };

  const openUpdateModal = (category) => {
    setIsUpdateMode(true);
    setSelectedCategory(category);
    setModalOpened(true);
  };

  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpened(true);
  };

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <div>
      <Button onClick={openCreateModal}>Create Category</Button>
      <CategoryList
        categories={categories}
        onEdit={openUpdateModal}
        onDelete={openDeleteDialog}
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
};

export default CategoryManagement;
