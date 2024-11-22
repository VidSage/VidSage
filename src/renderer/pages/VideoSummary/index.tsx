import React from 'react';
import { Typography, List, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// Dummy data for video segments
const videoSegments = [
  '[Clip 1] 00:00 - 00:20 展示户外秋天的场景',
  '[Clip 2] 00:20 - 01:30 5个人在打篮球',
  '[Clip 1] 01:30 - 02:10 展示有绿色植物的校园环境',
  '[Clip 3] 02:10 - 02:50 展示蓝色天空和大面积湖水',
  '[Clip 2] 02:50 - 03:20 展示校园和大量行人',
];

function VideoSummary() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate('/generate');
  };
  const handleNext = () => {
    navigate('/preview');
  };
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Title level={2}>Video Summary</Title>
      <Text>View your updated storyline</Text>

      <div style={{ margin: '20px auto', maxWidth: '600px' }}>
        <List
          bordered
          dataSource={videoSegments}
          renderItem={(item) => (
            <List.Item>
              <Text>{item}</Text>
            </List.Item>
          )}
        />
      </div>

      <div style={{ marginTop: '30px' }}>
        <Space>
          <Button type="default" danger onClick={handleBack}>
            Back
          </Button>
          <Button type="primary" onClick={handleNext}>
            Next
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default VideoSummary;
