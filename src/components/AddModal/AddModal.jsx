import React from 'react';
import FormBase from '../FormBase/FormBase';

const AddModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title = "Thêm mới", 
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
            submitText="Lưu dữ liệu"
        />
    );
};

export default AddModal;
