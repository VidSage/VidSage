import React, { useState } from 'react';
import { Typography, Input, Button, Space, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

function GenerateStoryline() {
  const [duration, setDuration] = useState(3);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/storyline');
  };

  const handleGenerate = () => {
    navigate('/summary');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Title level={2}>Generate Video Storyline</Title>
      <Text>Create your customized video storyline with ease</Text>

      <div style={{ margin: '20px auto', maxWidth: '600px' }}>
        <TextArea
          rows={5} // Adjusted height
          maxLength={100}
          placeholder="自然语言描述需要生成怎样的视频？e.g. 生成一个XX风格的视频"
          showCount
          style={{ width: '100%', marginTop: '20px' }}
        />
      </div>

      <div
        style={{ margin: '20px auto', maxWidth: '400px', textAlign: 'center' }}
      >
        <Text>Desired duration of video:</Text>
        <div
          style={{
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <InputNumber
            min={1}
            max={60}
            value={duration}
            onChange={(value) => setDuration(value || 1)}
            style={{ marginRight: '10px' }}
          />
          <Text>min</Text>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Space>
          <Button type="default" danger onClick={handleBack}>
            Back
          </Button>
          <Button type="primary" onClick={handleGenerate}>
            Generate Storyline
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default GenerateStoryline;
