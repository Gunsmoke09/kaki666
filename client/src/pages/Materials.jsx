import React, { useState, useEffect } from 'react';
import { Button, Loader, Alert, Modal, Text, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import MaterialList from '../components/Material/MaterialList';
import MaterialForm from '../components/Material/MaterialForm';
import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl('/materials'));

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
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return false;
    }

    try {
      const response = await fetch(buildApiUrl('/materials'), {
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

      await fetchMaterials();
      return true;
    } catch (err) {
      setError('Failed to create material');
      return false;
    }
  };

  const handleUpdateMaterial = async (materialData) => {
    const token = getAuthToken();
    if (!token || !selectedMaterial) {
      navigate('/login');
      return false;
    }

    try {
      const response = await fetch(buildApiUrl(`/materials/${selectedMaterial._id}`), {
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

      setSelectedMaterial(null);
      await fetchMaterials();
      return true;
    } catch (err) {
      setError('Failed to update material');
      return false;
    }
  };

  const handleDeleteMaterial = async () => {
    const token = getAuthToken();
    if (!token || !selectedMaterial) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/materials/${selectedMaterial._id}`), {
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
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setIsUpdateMode(true);
    setSelectedMaterial(material);
    setModalOpened(true);
  };

  const openDeleteDialog = (material) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

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
