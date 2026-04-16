import { Title, Text, Button, Stack, Group, Card, SimpleGrid } from '@mantine/core';
import { Link } from 'react-router-dom';

export default function Home() {
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
          <Button component={Link} to="/register" variant="light" size="md" radius="xl">
            Get Started
          </Button>
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card shadow="sm" padding="lg" radius="lg" withBorder>
          <Title order={3}>Tutorials</Title>
          <Text c="dimmed" mt="sm">
            Step-by-step guides for creative handcraft projects.
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="lg" withBorder>
          <Title order={3}>Categories</Title>
          <Text c="dimmed" mt="sm">
            Browse by craft type and find what interests you quickly.
          </Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="lg" withBorder>
          <Title order={3}>Materials</Title>
          <Text c="dimmed" mt="sm">
            Discover tools and materials needed for each activity.
          </Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}