import React from 'react';
import { Card, Button, Text, Group, SimpleGrid } from '@mantine/core';

function CategoryList({ categories, onEdit, onDelete, isLoggedIn }) {
  if (!categories.length) {
    return <Text c="dimmed">No categories available.</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
      {categories.map((category) => (
        <Card key={category._id} shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} size="lg">
            {category.name}
          </Text>

          {isLoggedIn && (
            <Group justify="right" mt="md">
              <Button variant="outline" onClick={() => onEdit(category)}>
                Edit
              </Button>
              <Button color="red" variant="outline" onClick={() => onDelete(category)}>
                Delete
              </Button>
            </Group>
          )}
        </Card>
      ))}
    </SimpleGrid>
  );
}

export default CategoryList;