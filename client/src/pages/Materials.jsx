import { useState, useEffect, useCallback } from 'react';
import { Button, Loader, Alert, Modal, Text, Group, Pagination, TextInput, Select, Stack, Title } from '@mantine/core';
import MaterialList from '../components/Material/MaterialList';
import MaterialForm from '../components/Material/MaterialForm';
import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';
import { parseLinkHeader, pageFromLink, readApiError } from '../utils/http';

const PAGE_LIMIT = 9;

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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');

  const token = getAuthToken();
  const isLoggedIn = Boolean(token);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        search,
        sort,
      });

      const response = await fetch(buildApiUrl(`/materials?${params.toString()}`));

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
  }, [page, search, sort]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const requireAuth = () => {
    if (isLoggedIn) return true;
    setError('Please log in to manage materials.');
    return false;
  };

  const handleCreateMaterial = async (materialData) => {
    if (!requireAuth()) return;

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
    if (!requireAuth()) return;

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
    if (!requireAuth()) return;

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
        {isLoggedIn ? (
          <Button onClick={() => { setIsUpdateMode(false); setSelectedMaterial(null); setModalOpened(true); }}>
            Create Material
          </Button>
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

      <MaterialList
        materials={materials}
        onEdit={(material) => { setIsUpdateMode(true); setSelectedMaterial(material); setModalOpened(true); }}
        onDelete={(material) => { setSelectedMaterial(material); setDeleteDialogOpened(true); }}
        isLoggedIn={isLoggedIn}
      />

      <Group justify="center">
        <Pagination value={page} onChange={setPage} total={totalPages} withEdges />
      </Group>

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
