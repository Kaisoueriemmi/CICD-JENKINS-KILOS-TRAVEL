import { useState, useCallback } from 'react';
import { useForm, UseFormProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface UseFormWithSubmitOptions<T extends FieldValues> extends UseFormProps<T> {
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for form handling with automatic validation and error handling
 */
export const useFormWithSubmit = <T extends FieldValues>({
  onSubmit,
  onSuccess,
  onError,
  ...formProps
}: UseFormWithSubmitOptions<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<T>(formProps);

  const handleSubmit = useCallback(
    async (data: T) => {
      try {
        setIsSubmitting(true);
        logger.debug('Form submission started', { formName: formProps.mode });
        
        await onSubmit(data);
        
        logger.info('Form submitted successfully', { formName: formProps.mode });
        toast.success('Opération réussie');
        
        onSuccess?.();
      } catch (error) {
        logger.error('Form submission failed', error as Error, { formName: formProps.mode });
        
        if (error instanceof Error) {
          toast.error(error.message || 'Une erreur est survenue');
          onError?.(error);
        } else {
          toast.error('Une erreur inconnue est survenue');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formProps.mode, onSubmit, onSuccess, onError]
  );

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
  };
};

/**
 * Hook for debounced async validation
 */
export const useDebouncedValidation = (
  asyncValidator: (value: string) => Promise<boolean>,
  delay = 500
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  let timeoutId: NodeJS.Timeout;

  const validate = useCallback(
    (value: string) => {
      setIsValidating(true);
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncValidator(value);
          setIsValid(result);
        } catch (error) {
          logger.error('Validation error', error as Error);
          setIsValid(false);
        } finally {
          setIsValidating(false);
        }
      }, delay);
    },
    [asyncValidator, delay]
  );

  return { validate, isValidating, isValid };
};

/**
 * Hook for field-level async validation
 */
export const useAsyncFieldValidation = (
  validator: (value: any) => Promise<string | null>
) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    async (value: any) => {
      try {
        setIsValidating(true);
        const result = await validator(value);
        setError(result);
        return result;
      } catch (err) {
        setError('Erreur de validation');
        logger.error('Async field validation error', err as Error);
        return 'Erreur de validation';
      } finally {
        setIsValidating(false);
      }
    },
    [validator]
  );

  return { validate, error, isValidating };
};
