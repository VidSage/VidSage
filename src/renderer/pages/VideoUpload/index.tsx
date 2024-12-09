import React, { useState } from 'react';
import { Button, List, Typography, Space, Avatar, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import summaryAtom from '../../states/summary';
import type { VideoFile } from '../../../main/types';

function VideoUpload() {
  const [videos, setVideos] = useState<string[]>([]);
  const navigate = useNavigate();

  const setSummaryAtom = useSetAtom(summaryAtom);

  const [loading, setLoading] = useState(false);

  const generateSummaries = async (files: VideoFile[]) => {
    setLoading(true);
    const summaries = await window.electron.ipcRenderer.invoke(
      'gen-summary',
      files,
    );
    setLoading(false);
    setSummaryAtom(summaries);
  };

  const handleViewSummaries = () => {
    generateSummaries(
      videos.map((video) => ({ name: video, absolutePath: video })),
    )
      .then(() => navigate('/storyline'))
      .catch((err) => {
        console.error(err);
      });
  };

  const handleAddVideos = async () => {
    try {
      const filePaths =
        await window.electron.ipcRenderer.invoke('select-videos');
      if (filePaths.length > 0) {
        setVideos((prev) => [...prev, ...filePaths]);
        message.success(`${filePaths.length} video(s) added to the list.`);
      } else {
        message.info('No video files were selected.');
      }
    } catch (error) {
      console.error('Error selecting videos:', error);
      message.error('Failed to add videos.');
    }
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
          <Button
            type="primary"
            onClick={handleViewSummaries}
            loading={loading}
          >
            View Summaries
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default VideoUpload;
