import React, { useState, useEffect } from 'react';
import { Button, Loader, Alert, Modal, Text, Group } from '@mantine/core';
import MaterialList from '../components/Material/MaterialList';
import MaterialForm from '../components/Material/MaterialForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('You must be logged in to view materials.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }

      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      setError('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async (materialData) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('You must be logged in to create materials.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        throw new Error('Failed to create material');
      }

      setModalOpened(false);
      await fetchMaterials();
    } catch (err) {
      setError('Failed to create material');
    }
  };

  const handleUpdateMaterial = async (materialData) => {
    const token = localStorage.getItem('jwt');
    if (!token || !selectedMaterial) {
      setError('You must be logged in to update materials.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/materials/${selectedMaterial._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        throw new Error('Failed to update material');
      }

      setModalOpened(false);
      setSelectedMaterial(null);
      await fetchMaterials();
    } catch (err) {
      setError('Failed to update material');
    }
  };

  const handleDeleteMaterial = async () => {
    const token = localStorage.getItem('jwt');
    if (!token || !selectedMaterial) {
      setError('You must be logged in to delete materials.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/materials/${selectedMaterial._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete material');
      }

      setDeleteDialogOpened(false);
      setSelectedMaterial(null);
      await fetchMaterials();
    } catch (err) {
      setError('Failed to delete material');
    }
  };

  const openCreateModal = () => {
    setIsUpdateMode(false);
    setSelectedMaterial(null);
    setModalOpened(true);
  };

  const openUpdateModal = (material) => {
    setIsUpdateMode(true);
    setSelectedMaterial(material);
    setModalOpened(true);
  };

  const openDeleteDialog = (material) => {
    setSelectedMaterial(material);
    setDeleteDialogOpened(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpened(false);
    setSelectedMaterial(null);
  };

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <div>
      <Button onClick={openCreateModal} mb="md">
        Create Material
      </Button>

      <MaterialList
        materials={materials}
        onEdit={openUpdateModal}
        onDelete={openDeleteDialog}
      />

      <MaterialForm
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        isUpdateMode={isUpdateMode}
        selectedMaterial={selectedMaterial}
        onCreate={handleCreateMaterial}
        onUpdate={handleUpdateMaterial}
      />

      <Modal
        opened={deleteDialogOpened}
        onClose={closeDeleteDialog}
        title="Delete Material"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete{' '}
          <strong>{selectedMaterial?.name}</strong>?
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={closeDeleteDialog}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteMaterial}>
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default Materials;