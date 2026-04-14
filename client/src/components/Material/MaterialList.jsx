// CategoryList.js
import React from 'react';
import { Card, Button, Text, Group, SimpleGrid } from '@mantine/core';

const MaterialList = ({ materials, onEdit, onDelete }) => {
  return (
    <SimpleGrid cols={3} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
      {materials.map((material) => (
          <Card shadow="sm" padding="lg" radius="md" key="{material._id}">
            <Text weight={500} size="lg">{material.name}</Text>
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => onEdit(material)}>Edit</Button>
              <Button color="red" variant="outline" onClick={() => onDelete(material)}>Delete</Button>
            </Group>
          </Card>
      ))}
    </SimpleGrid>
  );
};

export default MaterialList;
