import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Button, Card, Loader, Stack, Text, Title } from '@mantine/core';
import { buildApiUrl } from '../utils/api';
import { readApiError } from '../utils/http';

const MaterialDetail = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaterial = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(buildApiUrl(`/materials/${id}`));
        if (!response.ok) {
          throw new Error(await readApiError(response, 'Failed to fetch material'));
        }
        setMaterial(await response.json());
      } catch (err) {
        setError(err.message || 'Failed to fetch material');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;
  if (!material) return <Alert color="yellow">Material not found.</Alert>;

  return (
    <Stack>
      <Button component={Link} to="/materials" variant="subtle" w="fit-content">← Back to Materials</Button>
      <Card withBorder shadow="sm" padding="lg" radius="md">
        <Stack>
          <Title order={2}>{material.name}</Title>
          <Text>Purchase source: {material.purchaseSource || 'N/A'}</Text>
        </Stack>
      </Card>
    </Stack>
  );
};

export default MaterialDetail;
