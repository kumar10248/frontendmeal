import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { createMeal, updateMeal } from '../../lib/api';

export function MealForm({ meal, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const defaultValues = meal ? {
    ...meal,
    date: meal.date.substring(0, 10)
  } : {
    name: '',
    description: '',
    type: 'breakfast',
    date: format(new Date(), 'yyyy-MM-dd')
  };
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues
  });
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      if (meal?._id) {
        await updateMeal(meal._id, data);
      } else {
        await createMeal(data);
      }
      
      reset();
      onSuccess();
    } catch (error) {
      console.error("Error saving meal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{meal ? 'Edit Meal' : 'Add New Meal'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Meal Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Meal name is required' })}
              placeholder="Enter meal name"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter meal description"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Meal Type</Label>
            <Select defaultValue={defaultValues.type}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="snack">Snacks</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register('type', { required: true })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (meal ? 'Update Meal' : 'Add Meal')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}