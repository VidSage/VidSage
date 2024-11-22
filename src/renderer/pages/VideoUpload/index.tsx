import React, { useState } from 'react';
import { Button, List, Typography, Space, Avatar, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const dummyDescription =
  'Ant Design, a design language for background applications, is refined by Ant UED Team.';

function VideoUpload() {
  const [videos, setVideos] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleViewSummaries = () => {
    navigate('/storyline');
  };

  const handleAddVideos = () => {
    // Simulate adding videos (in real scenario, you'd use a file picker dialog)
    const newVideo = `Filename${videos.length + 1}.mp4`;
    setVideos((prev) => [...prev, newVideo]);
    message.success(`${newVideo} added to the list.`);
  };

  const handleRemoveVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
  };

  const handleClearList = () => {
    setVideos([]);
    message.info('Video list cleared.');
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Typography.Title level={2}>Upload Videos</Typography.Title>
      <Typography.Text>
        Click the button below to add videos to generate a storyline
      </Typography.Text>
      <div style={{ margin: '20px 0' }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleAddVideos}
        >
          Select Videos
        </Button>
      </div>
      {videos.length > 0 ? (
        <List
          bordered
          dataSource={videos}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Typography.Link
                  key="remove"
                  onClick={() => handleRemoveVideo(index)}
                >
                  remove
                </Typography.Link>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar>{item[0]}</Avatar>}
                title={item}
                description={dummyDescription}
              />
            </List.Item>
          )}
          style={{ margin: '20px auto', maxWidth: '600px' }}
        />
      ) : (
        <Typography.Text type="secondary">
          No videos selected yet. Please use the Select Videos button above to
          add some.
        </Typography.Text>
      )}
      <div style={{ marginTop: '20px' }}>
        <Space>
          <Button type="default" danger onClick={handleClearList}>
            Clear List
          </Button>
          <Button type="primary" onClick={handleViewSummaries}>
            View Summaries
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default VideoUpload;
