import { Title, Text, Button, Stack, Group, Card, SimpleGrid, Image } from '@mantine/core';
import { Link } from 'react-router-dom';

import { getAuthToken } from '../utils/auth';

const CARD_IMAGE_HEIGHT = 160;
const tutorialImg = `${import.meta.env.BASE_URL}images/tutorials.jpg`;
const categoryImg = `${import.meta.env.BASE_URL}images/categories.jpg`;
const materialImg = `${import.meta.env.BASE_URL}images/materials.jpg`;

export default function Home() {
  const isLoggedIn = Boolean(getAuthToken());

  return (
    <Stack gap="xl">
      <Stack gap="sm" ta="center" py="xl">
        <Title order={1} size="3rem">
          Learn Handcraft Skills Beautifully
        </Title>
        <Text size="lg" c="dimmed" maw={700} mx="auto">
          Explore tutorials, categories, and materials in one simple and elegant platform.
        </Text>

        <Group justify="center" mt="md">
          <Button component={Link} to="/tutorials" size="md" radius="xl">
            Explore Tutorials
          </Button>
          {!isLoggedIn && (
            <Button component={Link} to="/register" variant="light" size="md" radius="xl">
              Get Started
            </Button>
          )}
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card component={Link} to="/tutorials" shadow="sm" padding="lg" radius="lg" withBorder style={{ textDecoration: 'none' }}>
          <Image
            src={tutorialImg}
            h={CARD_IMAGE_HEIGHT}
            fit="cover"
            radius="md"
            alt="Tutorials card image"
          />
          <Title order={3}>Tutorials</Title>
          <Text c="dimmed" mt="sm">
            Step-by-step guides for creative handcraft projects.
          </Text>
        </Card>

        <Card component={Link} to="/categories" shadow="sm" padding="lg" radius="lg" withBorder style={{ textDecoration: 'none' }}>
          <Image
            src={categoryImg}
            h={CARD_IMAGE_HEIGHT}
            fit="cover"
            radius="md"
            alt="Categories card image"
          />
          <Title order={3}>Categories</Title>
          <Text c="dimmed" mt="sm">
            Browse by craft type and find what interests you quickly.
          </Text>
        </Card>

        <Card component={Link} to="/materials" shadow="sm" padding="lg" radius="lg" withBorder style={{ textDecoration: 'none' }}>
          <Image
            src={materialImg}
            h={CARD_IMAGE_HEIGHT}
            fit="cover"
            radius="md"
            alt="Materials card image"
          />
          <Title order={3}>Materials</Title>
          <Text c="dimmed" mt="sm">
            Discover tools and materials needed for each activity.
          </Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
