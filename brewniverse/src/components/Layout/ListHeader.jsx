import { Plus } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Shared/list.css';
import Button from '../UI/Button';

const ListHeader = ({ h1, buttonText, description, url, onCreate }) => {
    const navigate = useNavigate();

    const handleClick = async () => {
        if (onCreate) {
            const newId = await onCreate();
            if (newId) {
                const baseUrl = url.replace('/new', '');
                navigate(`${baseUrl}/${newId}/edit`);
            }
        }
        else {
            navigate(url);
        }
    };

    return (
        <div className="list-header">
            <div className="header-content">
                <h1>{h1}</h1>
                <p>{description}</p>
            </div>
            <Button
                variant="primary"
                size="large"
                onClick={handleClick}
            >
                <Plus size={20} />
                {buttonText}
            </Button>
        </div>);
};

export default ListHeader;