// DeleteConfirmationDialog.js
import React from 'react';
import { Dialog, Button, Group } from '@mantine/core';

const DeleteConfirmationDialog = ({ opened, onClose, onConfirm }) => {
  return (
    <Dialog opened={opened} onClose={onClose} title="Confirm Deletion">
      <p>Are you sure you want to delete this category?</p>
      <Group position="right" mt="md">
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm}>Delete</Button>
      </Group>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
