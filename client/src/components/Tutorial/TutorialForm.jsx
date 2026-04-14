import React, { useEffect, useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  MultiSelect,
  LoadingOverlay,
  Select,
  NumberInput,
  Stack,
  Text
} from '@mantine/core';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TutorialForm = ({ opened, onClose, onSubmit, action, tutorial }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [averageTimeSpentMinutes, setAverageTimeSpentMinutes] = useState(0);
  const [difficulty, setDifficulty] = useState('Beginner');

  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tutorial) {
      setTitle(tutorial.title || '');
      setDescription(tutorial.description || '');
      setInstructions(tutorial.instructions || '');
      setAverageTimeSpentMinutes(tutorial.AverageTimeSpentMinutes || 0);
      setDifficulty(tutorial.difficulty || 'Beginner');

      setSelectedCategories(
        tutorial.categories?.map((cat) => cat._id || cat) || []
      );

      setSelectedMaterials(
        tutorial.material?.map((item) => ({
          materialId:
            item.materialId?._id ||
            item.materialId ||
            item.material?._id ||
            item.material ||
            '',
          quantity: item.quantity || 1,
          unit: item.unit || '',
        })) || []
      );
    } else {
      setTitle('');
      setDescription('');
      setInstructions('');
      setAverageTimeSpentMinutes(0);
      setDifficulty('Beginner');
      setSelectedCategories([]);
      setSelectedMaterials([]);
    }
  }, [tutorial]);

  const fetchData = async () => {
    const token = localStorage.getItem('jwt');

    try {
      const [categoryResponse, materialResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/materials`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const categoryData = await categoryResponse.json();
      const materialData = await materialResponse.json();

      setCategories(categoryData);
      setMaterials(materialData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (opened) {
      setIsLoading(true);
      fetchData();
    }
  }, [opened]);

  const handleMaterialChange = (index, field, value) => {
    setSelectedMaterials((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addMaterialRow = () => {
    setSelectedMaterials((prev) => [
      ...prev,
      { materialId: '', quantity: 1, unit: '' },
    ]);
  };

  const removeMaterialRow = (index) => {
    setSelectedMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const tutorialData = {
      title,
      description,
      instructions,
      AverageTimeSpentMinutes: Number(averageTimeSpentMinutes),
      difficulty,
      categories: selectedCategories,
      material: selectedMaterials.map((item) => ({
        materialId: item.materialId,
        quantity: Number(item.quantity),
        unit: item.unit,
      })),
    };

    onSubmit(tutorialData);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`${action} Tutorial`} size="lg">
      <LoadingOverlay visible={isLoading} loaderProps={{ children: 'Loading...' }} />

      <Stack>
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Textarea
          label="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          minRows={4}
        />

        <NumberInput
          label="Average Time Spent (Minutes)"
          value={averageTimeSpentMinutes}
          onChange={setAverageTimeSpentMinutes}
          min={0}
        />

        <Select
          label="Difficulty"
          data={['Beginner', 'Intermediate', 'Advanced']}
          value={difficulty}
          onChange={(value) => setDifficulty(value || 'Beginner')}
        />

        <MultiSelect
          label="Categories"
          data={categories.map((cat) => ({
            value: cat._id,
            label: cat.name,
          }))}
          value={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="Select categories"
        />

        <Text fw={500}>Materials</Text>

        {selectedMaterials.map((item, index) => (
          <Group key={index} grow align="end">
            <Select
              label="Material"
              data={materials.map((mat) => ({
                value: mat._id,
                label: mat.name,
              }))}
              value={item.materialId}
              onChange={(value) =>
                handleMaterialChange(index, 'materialId', value || '')
              }
              placeholder="Select material"
            />

            <NumberInput
              label="Quantity"
              value={item.quantity}
              onChange={(value) =>
                handleMaterialChange(index, 'quantity', value || 1)
              }
              min={1}
            />

            <TextInput
              label="Unit"
              value={item.unit}
              onChange={(e) =>
                handleMaterialChange(index, 'unit', e.target.value)
              }
            />

            <Button color="red" variant="light" onClick={() => removeMaterialRow(index)}>
              Remove
            </Button>
          </Group>
        ))}

        <Button variant="light" onClick={addMaterialRow}>
          Add Material
        </Button>

        <Group justify="right" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{action}</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default TutorialForm;