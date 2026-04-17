import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Button, Card, Group, Loader, Pagination, Stack, Text, Title } from '@mantine/core';
import TutorialList from '../components/Tutorial/TutorialList';
import { buildApiUrl } from '../utils/api';
import { parseLinkHeader, pageFromLink, readApiError } from '../utils/http';
import { getAuthToken } from '../utils/auth';

const PAGE_LIMIT = 9;

const CategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isLoggedIn = Boolean(getAuthToken());

  const fetchCategoryDetail = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [categoryResponse, tutorialsResponse] = await Promise.all([
        fetch(buildApiUrl(`/categories/${id}`)),
        fetch(buildApiUrl(`/categories/${id}/tutorials?page=${page}&limit=${PAGE_LIMIT}`)),
      ]);

      if (!categoryResponse.ok) {
        throw new Error(await readApiError(categoryResponse, 'Failed to fetch category'));
      }

      if (!tutorialsResponse.ok) {
        throw new Error(await readApiError(tutorialsResponse, 'Failed to fetch related tutorials'));
      }

      const categoryData = await categoryResponse.json();
      const tutorialsData = await tutorialsResponse.json();
      const links = parseLinkHeader(tutorialsResponse.headers.get('Link'));

      setCategory(categoryData);
      setTutorials(Array.isArray(tutorialsData) ? tutorialsData : []);
      setTotalPages(pageFromLink(links.last) || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch category detail');
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchCategoryDetail();
  }, [fetchCategoryDetail]);

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;
  if (!category) return <Alert color="yellow">Category not found.</Alert>;

  return (
    <Stack>
      <Button component={Link} to="/categories" variant="subtle" w="fit-content">← Back to Categories</Button>

      <Card withBorder shadow="sm" padding="lg" radius="md">
        <Title order={2}>{category.name}</Title>
        <Text c="dimmed" mt="sm">{category.description || 'No description provided.'}</Text>
      </Card>

      <Title order={3}>Tutorials in this category</Title>
      <TutorialList
        tutorials={tutorials}
        onRefresh={fetchCategoryDetail}
        isLoggedIn={isLoggedIn}
        emptyMessage="No tutorials found in this category"
      />

      <Group justify="center" mt="md">
        <Pagination value={page} onChange={setPage} total={totalPages} withEdges size="md" radius="md" />
      </Group>
    </Stack>
  );
};

export default CategoryDetail;
