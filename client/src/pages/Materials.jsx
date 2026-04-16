import { useState, useEffect, useCallback } from 'react';
import { Button, Loader, Alert, Modal, Text, Group, Pagination, TextInput, Select, Stack, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import MaterialList from '../components/Material/MaterialList';
import MaterialForm from '../components/Material/MaterialForm';
import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';
import { parseLinkHeader, pageFromLink, readApiError } from '../utils/http';

const PAGE_LIMIT = 10;

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [deleteDialogOpened, setDeleteDialogOpened] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();
  const token = getAuthToken();

  const fetchMaterials = useCallback(async () => {
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

      const response = await fetch(buildApiUrl(`/materials?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Failed to fetch materials'));
      }

      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);

      const links = parseLinkHeader(response.headers.get('Link'));
      setTotalPages(pageFromLink(links.last) || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  }, [navigate, page, search, sortOrder, token]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleCreateMaterial = async (materialData) => {
    const response = await fetch(buildApiUrl('/materials'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(materialData),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Failed to create material'));
    }

    setPage(1);
    setModalOpened(false);
    await fetchMaterials();
  };

  const handleUpdateMaterial = async (materialData) => {
    const response = await fetch(buildApiUrl(`/materials/${selectedMaterial._id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(materialData),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Failed to update material'));
    }

    setSelectedMaterial(null);
    setModalOpened(false);
    await fetchMaterials();
  };

  const handleDeleteMaterial = async () => {
    const response = await fetch(buildApiUrl(`/materials/${selectedMaterial._id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setError(await readApiError(response, 'Failed to delete material'));
      return;
    }

    setDeleteDialogOpened(false);
    setSelectedMaterial(null);
    await fetchMaterials();
  };

  if (loading) return <Loader />;

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Materials</Title>
        <Button onClick={() => { setIsUpdateMode(false); setSelectedMaterial(null); setModalOpened(true); }}>
          Create Material
        </Button>
      </Group>

      {error ? <Alert color="red">{error}</Alert> : null}

      <Group>
        <TextInput
          placeholder="Search by name or purchase source"
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

      <MaterialList
        materials={materials}
        onEdit={(material) => { setIsUpdateMode(true); setSelectedMaterial(material); setModalOpened(true); }}
        onDelete={(material) => { setSelectedMaterial(material); setDeleteDialogOpened(true); }}
      />

      <Pagination value={page} onChange={setPage} total={totalPages} withEdges />

      <MaterialForm
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        isUpdateMode={isUpdateMode}
        selectedMaterial={selectedMaterial}
        onCreate={handleCreateMaterial}
        onUpdate={handleUpdateMaterial}
      />

      <Modal opened={deleteDialogOpened} onClose={() => setDeleteDialogOpened(false)} title="Delete Material" centered>
        <Text mb="md">
          Are you sure you want to delete <strong>{selectedMaterial?.name}</strong>?
        </Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteDialogOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteMaterial}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
};

export default Materials;
