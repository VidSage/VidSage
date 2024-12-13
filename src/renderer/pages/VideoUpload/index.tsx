import React, { useState } from 'react';
import {
  Button,
  List,
  Typography,
  Space,
  Avatar,
  message,
  Input,
  Radio,
} from 'antd';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import summaryAtom from '../../states/summary';
import { getFileNameWithoutExtension } from '../../common/util';
import type { VideoFile } from '../../../main/types';

function VideoUpload() {
  const [videos, setVideos] = useState<string[]>([]);
  const navigate = useNavigate();

  const setSummaryAtom = useSetAtom(summaryAtom);

  const [loading, setLoading] = useState(false);

  // Provider selection: 'openai' or 'azure'
  const [provider, setProvider] = useState<'openai' | 'azure'>('openai');

  // For OpenAI
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyApplied, setIsApiKeyApplied] = useState(false);

  // For Azure OpenAI
  const [azureEndpoint, setAzureEndpoint] = useState('');
  const [azureDeploymentName, setAzureDeploymentName] = useState('');
  const [azureApiKey, setAzureApiKey] = useState('');
  const [isAzureApplied, setIsAzureApplied] = useState(false);
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
      videos.map((video) => ({
        name: getFileNameWithoutExtension(video),
        absolutePath: video,
      })),
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
  
  const handleSaveOpenAiApiKey = async () => {
    try {
      setIsApiKeyApplied(false);
      // First validate the API key
      const { valid, error } = await window.electron.ipcRenderer.invoke(
        'validate-api-key',
        apiKey,
      );
      if (!valid) {
        message.error(error || 'Invalid API key.');
        return;
      }

      // If valid, then set the API key
      const { success } = await window.electron.ipcRenderer.invoke(
        'set-api-key',
        apiKey,
      );
      if (success) {
        message.success('API key applied successfully.');
        setIsApiKeyApplied(true);
      } else {
        message.error('Failed to apply API key.');
      }
    } catch (error) {
      message.error('An error occurred while applying the API key.');
      console.error(error);
    }
  };

  const handleSaveAzureCredentials = async () => {
    try {
      setIsAzureApplied(false);

      // Validate the Azure OpenAI credentials
      const { valid, error } = await window.electron.ipcRenderer.invoke(
        'validate-azure-credentials',
        {
          endpoint: azureEndpoint,
          deploymentName: azureDeploymentName,
          key: azureApiKey,
        },
      );
      if (!valid) {
        message.error(error || 'Invalid Azure credentials.');
        return;
      }

      // If valid, set the Azure credentials
      const { success } = await window.electron.ipcRenderer.invoke(
        'set-azure-credentials',
        {
          endpoint: azureEndpoint,
          deploymentName: azureDeploymentName,
          key: azureApiKey,
        },
      );
      if (success) {
        message.success('Azure OpenAI credentials applied successfully.');
        setIsAzureApplied(true);
      } else {
        message.error('Failed to apply Azure OpenAI credentials.');
      }
    } catch (error) {
      message.error('An error occurred while applying the Azure credentials.');
      console.error(error);
    }
  };

  const isViewSummariesDisabled = (() => {
    if (provider === 'openai') {
      return !isApiKeyApplied || videos.length === 0;
    }
    return !isAzureApplied || videos.length === 0;
  })();

  const handleProviderChange = (e: any) => {
    setProvider(e.target.value);
    // Reset states when switching provider
    setIsApiKeyApplied(false);
    setIsAzureApplied(false);
  };

  // Determine which apply button icon and text to show
  let applyButtonIcon: React.ReactNode = null;
  let applyButtonText = 'Apply';

  if (provider === 'openai' && isApiKeyApplied) {
    applyButtonIcon = <CheckCircleOutlined className="check-animation" />;
    applyButtonText = 'Applied';
  } else if (provider === 'azure' && isAzureApplied) {
    applyButtonIcon = <CheckCircleOutlined className="check-animation" />;
    applyButtonText = 'Applied';
  }

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
          renderItem={(item, index) => {
            const title = getFileNameWithoutExtension(item);
            return (
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
                  avatar={<Avatar>{title[0]}</Avatar>}
                  title={item}
                />
              </List.Item>
            );
          }}
          style={{ margin: '20px auto', maxWidth: '600px' }}
        />
      ) : (
        <Typography.Text type="secondary">
          No videos selected yet. Please use the Select Videos button above to
          add some.
        </Typography.Text>
      )}
      <div style={{ marginBottom: '20px' }}>
        <Radio.Group onChange={handleProviderChange} value={provider}>
          <Radio value="openai">OpenAI</Radio>
          <Radio value="azure">Azure OpenAI</Radio>
        </Radio.Group>
      </div>

      {provider === 'openai' && (
        <>
          <Typography.Text>
            Enter your OpenAI API Key and then select videos to generate a
            storyline.
          </Typography.Text>
          <div
            style={{
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Input.Password
              placeholder="Enter OpenAI API Key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsApiKeyApplied(false);
              }}
              style={{ width: '300px', marginRight: '10px' }}
            />
            <Button
              type="primary"
              onClick={handleSaveOpenAiApiKey}
              icon={applyButtonIcon}
            >
              {applyButtonText}
            </Button>
          </div>
        </>
      )}

      {provider === 'azure' && (
        <>
          <Typography.Text>
            Enter your Azure OpenAI credentials (Endpoint, Deployment Name, and
            Key).
          </Typography.Text>
          <div style={{ marginTop: '20px' }}>
            <Input
              placeholder="Endpoint URL"
              value={azureEndpoint}
              onChange={(e) => {
                setAzureEndpoint(e.target.value);
                setIsAzureApplied(false);
              }}
              style={{ width: '300px', marginBottom: '10px' }}
            />
            <br />
            <Input
              placeholder="Deployment Name"
              value={azureDeploymentName}
              onChange={(e) => {
                setAzureDeploymentName(e.target.value);
                setIsAzureApplied(false);
              }}
              style={{ width: '300px', marginBottom: '10px' }}
            />
            <br />
            <Input.Password
              placeholder="API Key"
              value={azureApiKey}
              onChange={(e) => {
                setAzureApiKey(e.target.value);
                setIsAzureApplied(false);
              }}
              style={{ width: '300px', marginBottom: '10px' }}
            />
            <br />
            <Button
              type="primary"
              onClick={handleSaveAzureCredentials}
              icon={applyButtonIcon}
            >
              {applyButtonText}
            </Button>
          </div>
        </>
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
            disabled={isViewSummariesDisabled}
          >
            View Summaries
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default VideoUpload;
