import React from 'react';
import { Typography, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

function VideoPreview() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/summary');
  };
  const handleSave = () => {
    console.log('TODO: Save video');
  };
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Title level={2}>Video Preview</Title>
      <Text>View your updated storyline</Text>

      <div
        style={{
          margin: '30px auto',
          width: '80%',
          height: '400px',
          backgroundColor: '#e0e0e0',
          border: '2px solid #1890ff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text type="secondary">Video Placeholder</Text>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Space>
          <Button type="default" danger onClick={handleBack}>
            Back
          </Button>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default VideoPreview;
