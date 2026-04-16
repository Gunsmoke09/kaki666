import React from 'react';
import { Modal, Text, Button, Group } from '@mantine/core';

function CategoryDeleteConfirm({ opened, onClose, onConfirm }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Category"
      centered
    >
      <Text mb="md">
        Are you sure you want to delete this category?
      </Text>

      <Group justify="right">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}

export default CategoryDeleteConfirm;