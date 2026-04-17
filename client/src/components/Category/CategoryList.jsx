import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Text, Group, SimpleGrid } from '@mantine/core';

function CategoryList({ categories, onEdit, onDelete, isLoggedIn }) {
  if (!categories.length) {
    return <Text c="dimmed">No categories available.</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }} spacing="lg" verticalSpacing="lg">
      {categories.map((category) => (
        <Card key={category._id} shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={600} size="lg">
            {category.name}
          </Text>
          {category.description ? (
            <Text c="dimmed" lineClamp={3} mt="xs">{category.description}</Text>
          ) : null}

          <Group mt="md" wrap="wrap">
            <Button component={Link} to={`/categories/${category._id}`} variant="light">
              View Details
            </Button>

            {isLoggedIn && (
              <>
                <Button variant="outline" onClick={() => onEdit(category)}>
                  Edit
                </Button>
                <Button color="red" variant="outline" onClick={() => onDelete(category)}>
                  Delete
                </Button>
              </>
            )}
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}

export default CategoryList;
