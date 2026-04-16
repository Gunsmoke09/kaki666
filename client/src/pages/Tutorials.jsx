import { useState, useEffect, useCallback } from 'react';
import { Loader, Pagination, Button, Alert, Group, TextInput, Select, Stack, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import TutorialList from '../components/Tutorial/TutorialList';
import TutorialForm from '../components/Tutorial/TutorialForm';
import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';
import { parseLinkHeader, pageFromLink, readApiError } from '../utils/http';

const PAGE_LIMIT = 10;

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('difficulty');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();
  const token = getAuthToken();

  const fetchTutorials = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        search,
        sortBy,
        sortOrder,
      });

      const response = await fetch(buildApiUrl(`/tutorials?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, `Error: ${response.statusText}`));
      }

      const data = await response.json();
      setTutorials(Array.isArray(data) ? data : []);

      const links = parseLinkHeader(response.headers.get('Link'));
      setTotalPages(pageFromLink(links.last) || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch tutorials');
    } finally {
      setLoading(false);
    }
  }, [navigate, page, search, sortBy, sortOrder, token]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const createTutorial = async (tutorialData) => {
    const response = await fetch(buildApiUrl('/tutorials'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tutorialData),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response, 'Failed to create tutorial'));
    }

    setModalOpen(false);
    setPage(1);
    await fetchTutorials();
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Tutorials</Title>
        <Button onClick={() => setModalOpen(true)}>New Tutorial</Button>
      </Group>

      {error ? <Alert color="red">{error}</Alert> : null}

      <Group>
        <TextInput
          placeholder="Search by title"
          value={search}
          onChange={(event) => {
            setSearch(event.currentTarget.value);
            setPage(1);
          }}
        />

        <Select
          label="Sort By"
          value={sortBy}
          data={[
            { value: 'difficulty', label: 'Difficulty' },
            { value: 'AverageTimeSpentMinutes', label: 'Time spent' },
          ]}
          onChange={(value) => {
            setSortBy(value || 'difficulty');
            setPage(1);
          }}
        />

        <Select
          label="Order"
          value={sortOrder}
          data={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
          onChange={(value) => {
            setSortOrder(value || 'asc');
            setPage(1);
          }}
        />
      </Group>

      <TutorialForm opened={modalOpen} onClose={() => setModalOpen(false)} onSubmit={createTutorial} action="New" />

      <Pagination value={page} onChange={setPage} total={totalPages} withEdges />

      {loading ? <Loader /> : <TutorialList tutorials={tutorials} onRefresh={fetchTutorials} />}
    </Stack>
  );
};

export default Tutorials;
