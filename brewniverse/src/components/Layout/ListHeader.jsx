import { Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Shared/list.css';
import Button from '../UI/Button';

const ListHeader = ({ h1, buttonText, description, url }) => {
    const navigate = useNavigate();

    return (
        <div className="list-header">
            <div className="header-content">
                <h1>{h1}</h1>
                <p>{description}</p>
            </div>
            <Button
                variant="primary"
                size="large"
                onClick={() => navigate(url)}
            >
                <Plus size={20} />
                {buttonText}
            </Button>
        </div>);
};

export default ListHeader;