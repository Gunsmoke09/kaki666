import { useState, useEffect, useCallback } from 'react';
import { Loader, Pagination, Button, Alert, Group, TextInput, Select, Stack, Title } from '@mantine/core';
import TutorialList from '../components/Tutorial/TutorialList';
import TutorialForm from '../components/Tutorial/TutorialForm';
import { buildApiUrl } from '../utils/api';
import { getAuthToken } from '../utils/auth';
import { parseLinkHeader, pageFromLink, readApiError } from '../utils/http';

const PAGE_LIMIT = 9;

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('difficulty_asc');

  const token = getAuthToken();
  const isLoggedIn = Boolean(token);

  const fetchTutorials = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
        search,
        sort,
      });

      const response = await fetch(buildApiUrl(`/tutorials?${params.toString()}`));

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
  }, [page, search, sort]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

  const createTutorial = async (tutorialData) => {
    if (!isLoggedIn) {
      setError('Please log in to create tutorials.');
      return;
    }

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
      <Group justify="space-between" wrap="wrap">
        <Title order={2}>Tutorials</Title>
        {isLoggedIn ? <Button onClick={() => setModalOpen(true)}>New Tutorial</Button> : null}
      </Group>

      {error ? <Alert color="red">{error}</Alert> : null}

      <Group align="end" wrap="wrap">
        <TextInput
          style={{ flex: 1, minWidth: 220 }}
          placeholder="Search by title"
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
        />
        <Button onClick={() => { setSearch(searchInput.trim()); setPage(1); }}>
          Search
        </Button>

        <Select
          style={{ minWidth: 240 }}
          label="Sort"
          value={sort}
          data={[
            { value: 'name_asc', label: 'Name ascending' },
            { value: 'name_desc', label: 'Name descending' },
            { value: 'difficulty_asc', label: 'From easiest' },
            { value: 'difficulty_desc', label: 'From hardest' },
            { value: 'time_asc', label: 'From least time spent' },
            { value: 'time_desc', label: 'From most time spent' },
          ]}
          onChange={(value) => {
            setSort(value || 'difficulty_asc');
            setPage(1);
          }}
        />
      </Group>

      <TutorialForm opened={modalOpen} onClose={() => setModalOpen(false)} onSubmit={createTutorial} action="New" />

      {loading ? <Loader /> : <TutorialList tutorials={tutorials} onRefresh={fetchTutorials} isLoggedIn={isLoggedIn} />}

      <Group justify="center" mt="md">
        <Pagination value={page} onChange={setPage} total={totalPages} withEdges size="md" radius="md" />
      </Group>
    </Stack>
  );
};

export default Tutorials;
