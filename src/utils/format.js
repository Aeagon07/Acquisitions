export const formatValidationErrors = (errors) => {
    if(!errors || !errors.issues) return 'Validation failed';

    if(Array.isArray(errors.issues)) {
        return errors.issues.map((i) => {
            const field = i.path.join('.');
            return field ? `${field}: ${i.message}` : i.message;
        }).join(', ');
    }

    return JSON.stringify(errors);
}
