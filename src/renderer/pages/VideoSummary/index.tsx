import { Typography, List, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
import storylineAtom from '../../states/storyline';
import previewAtom from '../../states/preview';

const { Title, Text } = Typography;

function VideoSummary() {
  const navigate = useNavigate();

  const storyline = useAtomValue(storylineAtom);
  const setPreviewAtom = useSetAtom(previewAtom);

  const handleBack = () => {
    navigate('/generate');
  };

  const generatePreview = async () => {
    const preview = await window.electron.ipcRenderer.invoke('gen-video', {
      storyline,
    });
    setPreviewAtom(preview);
  };

  const handleNext = () => {
    generatePreview()
      .then(() => navigate('/preview'))
      .catch(console.error);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Title level={2}>Video Summary</Title>
      <Text>View your updated storyline</Text>

      <div style={{ margin: '20px auto', maxWidth: '600px' }}>
        <List
          bordered
          dataSource={storyline}
          renderItem={(segment) => (
            <List.Item>
              <Text>
                <strong>[{segment.srcFile?.name || 'Summary'}]</strong>{' '}
                {segment.startTimeSec.toFixed(2)} -{' '}
                {segment.endTimeSec.toFixed(2)} {segment.description}
              </Text>
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
            Generate Preview
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default VideoSummary;
