import React from 'react';
import FormBase from '../FormBase/FormBase';

const EditModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title = "Chỉnh sửa", 
    initialData = {}, 
    fields = [], 
    isLoading = false 
}) => {
    return (
        <FormBase
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={title}
            initialData={initialData}
            fields={fields}
            isLoading={isLoading}
            submitText="Cập nhật"
        />
    );
};

export default EditModal;
