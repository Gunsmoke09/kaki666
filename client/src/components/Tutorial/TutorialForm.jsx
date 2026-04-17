import { useEffect, useState } from 'react';
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
  Text,
  Alert,
} from '@mantine/core';
import { buildApiUrl } from '../../utils/api';

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
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!opened) {
      return;
    }

    if (tutorial) {
      setTitle(tutorial.title || '');
      setDescription(tutorial.description || '');
      setInstructions(tutorial.instructions || '');
      setAverageTimeSpentMinutes(tutorial.AverageTimeSpentMinutes || 0);
      setDifficulty(tutorial.difficulty || 'Beginner');
      setSelectedCategories(tutorial.categories?.map((cat) => cat._id || cat) || []);
      setSelectedMaterials(
        tutorial.material?.map((item) => ({
          material: item.material?._id || item.material || item.materialId || '',
          quantity: item.quantity ?? '',
          unit: item.unit || '',
          note: item.note || '',
        })) || [],
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

    setFormError('');
  }, [opened, tutorial]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryResponse, materialResponse] = await Promise.all([
          fetch(buildApiUrl('/categories?page=1&limit=100')),
          fetch(buildApiUrl('/materials?page=1&limit=100')),
        ]);

        const categoryData = await categoryResponse.json();
        const materialData = await materialResponse.json();

        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setMaterials(Array.isArray(materialData) ? materialData : []);
      } catch (err) {
        setCategories([]);
        setMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (opened) {
      setIsLoading(true);
      fetchData();
    }
  }, [opened]);

  const handleMaterialChange = (index, field, value) => {
    setSelectedMaterials((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');

    if (selectedCategories.length === 0) {
      setFormError('Please select at least one category.');
      setSubmitting(false);
      return;
    }

    const tutorialData = {
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      AverageTimeSpentMinutes: Number(averageTimeSpentMinutes),
      difficulty,
      categories: selectedCategories,
      material: selectedMaterials.map((item) => ({
        material: item.material,
        quantity: item.quantity === '' || item.quantity == null ? undefined : Number(item.quantity),
        unit: item.unit?.trim() || undefined,
        note: item.note,
      })),
    };

    try {
      await onSubmit(tutorialData);
    } catch (err) {
      setFormError(err.message || 'Failed to save tutorial');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`${action} Tutorial`} size="lg">
      <LoadingOverlay visible={isLoading} loaderProps={{ children: 'Loading...' }} />

      <form onSubmit={handleSubmit}>
        <Stack>
          {formError ? <Alert color="red">{formError}</Alert> : null}
          <TextInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <Textarea label="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} minRows={4} required />

          <NumberInput label="Average Time Spent (Minutes)" value={averageTimeSpentMinutes} onChange={setAverageTimeSpentMinutes} min={0} required />

          <Select label="Difficulty" data={['Beginner', 'Intermediate', 'Advanced']} value={difficulty} onChange={(value) => setDifficulty(value || 'Beginner')} />

          <MultiSelect
            label="Categories"
            data={categories.map((cat) => ({ value: cat._id, label: cat.name }))}
            value={selectedCategories}
            onChange={setSelectedCategories}
            placeholder="Select categories"
            required
          />

          <Text fw={500}>Materials</Text>

          {selectedMaterials.map((item, index) => (
            <Group key={`${item.material || 'material'}-${index}`} grow align="end" wrap="wrap">
              <Select
                style={{ minWidth: 180, flex: 1 }}
                label="Material"
                data={materials.map((mat) => ({ value: mat._id, label: mat.name }))}
                value={item.material}
                onChange={(value) => handleMaterialChange(index, 'material', value || '')}
                placeholder="Select material"
                required
              />

              <NumberInput style={{ minWidth: 140 }} label="Quantity (optional)" value={item.quantity} onChange={(value) => handleMaterialChange(index, 'quantity', value ?? '')} min={0.01} />

              <TextInput style={{ minWidth: 120 }} label="Unit (optional)" value={item.unit} onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)} />

              <Button type="button" color="red" variant="light" onClick={() => setSelectedMaterials((prev) => prev.filter((_, i) => i !== index))}>
                Remove
              </Button>
            </Group>
          ))}

          <Button type="button" variant="light" onClick={() => setSelectedMaterials((prev) => [...prev, { material: '', quantity: '', unit: '', note: '' }])}>
            Add Material
          </Button>

          <Group justify="right" mt="md">
            <Button type="button" variant="default" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>{action}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TutorialForm;
