import React from 'react';
import { Typography, List, Button, Space, Collapse, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useAtom } from 'jotai';
import storylineAtom from '../../states/storyline';
import previewAtom from '../../states/preview';
import summaryAtom from '../../states/summary';
import { getTimeStamp } from '../../common/util';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

function VideoSummary() {
  const navigate = useNavigate();

  const storyline = useAtomValue(storylineAtom);
  const [preview, setPreviewAtom] = useAtom(previewAtom);
  const summaries = useAtomValue(summaryAtom);

  const handleBack = () => {
    navigate('/generate');
  };

  const generatePreview = async () => {
    const newPreview = await window.electron.ipcRenderer.invoke('gen-video', {
      storyline,
    });
    setPreviewAtom(newPreview);
  };

  const handleSave = () => {};

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Title level={2}>Video Summary</Title>
      <Text>View your updated storyline</Text>

      {/* Section: Original and Adjusted Storylines */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        <div style={{ flex: 1 }}>
          <Text strong>Original Clip Storylines</Text>
          <Collapse accordion style={{ marginTop: '10px' }}>
            {summaries.map((clip) => (
              <Panel header={clip.file.name} key={clip.file.name}>
                <List
                  dataSource={clip.segments}
                  renderItem={(segment) => (
                    <List.Item>
                      <Text>
                        {`${getTimeStamp(segment.startTimeSec)} - ${getTimeStamp(segment.endTimeSec)}: ${segment.description}`}
                      </Text>
                    </List.Item>
                  )}
                  bordered
                  style={{ backgroundColor: '#f9f9f9' }}
                />
              </Panel>
            ))}
          </Collapse>
        </div>

        <div style={{ flex: 1, maxWidth: '600px' }}>
          <Text strong>Adjusted Storyline</Text>
          <List
            bordered
            style={{ marginTop: '10px' }}
            dataSource={storyline}
            renderItem={(segment) => (
              <List.Item>
                <Text>
                  <strong>[{segment.srcFile?.name || 'Summary'}]</strong>{' '}
                  {`${getTimeStamp(segment.startTimeSec)} - ${getTimeStamp(segment.endTimeSec)}`}{' '}
                  {segment.description}
                </Text>
              </List.Item>
            )}
          />
        </div>
      </div>

      {/* Section: Adjust Generated Storyline */}
      <div
        style={{
          marginTop: '30px',
          textAlign: 'center', // Center-align the entire section
        }}
      >
        <Title level={4}>Adjust Generated Storyline</Title>
        <TextArea
          placeholder="Adjust the generated storyline here"
          rows={6}
          maxLength={100}
          style={{
            width: '100%',
            maxWidth: '800px',
            margin: '10px auto', // Center-align horizontally
          }}
        />
        <Button
          type="primary"
          style={{
            marginTop: '10px',
            display: 'block', // Block element for full-width alignment
            marginLeft: 'auto', // Center-align button
            marginRight: 'auto',
          }}
          onClick={() => console.log('Storyline updated')}
        >
          Update Storyline
        </Button>
      </div>

      {/* Section: Video Preview */}
      <div
        style={{
          marginTop: '30px',
          textAlign: 'center', // Center-align the title and content
        }}
      >
        <Title level={4}>Video Preview</Title>
        <div
          style={{
            marginTop: '10px',
            width: '100%',
            height: '300px',
            backgroundColor: '#e9e9e9',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>Video Preview Area</Text>
        </div>
      </div>

      {/* Navigation Buttons */}
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

export default VideoSummary;
