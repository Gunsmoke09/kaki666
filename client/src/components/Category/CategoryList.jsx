// CategoryList.js
import React from 'react';
import { Card, Button, Text, Group, SimpleGrid } from '@mantine/core';

const CategoryList = ({ categories, onEdit, onDelete }) => {
  return (
    <SimpleGrid cols={3} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
      {categories.map((category) => (
          <Card shadow="sm" padding="lg" radius="md" key="{category._id}">
            <Text weight={500} size="lg">{category.name}</Text>
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => onEdit(category)}>Edit</Button>
              <Button color="red" variant="outline" onClick={() => onDelete(category)}>Delete</Button>
            </Group>
          </Card>
      ))}
    </SimpleGrid>
  );
};

export default CategoryList;
