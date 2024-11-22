import React from 'react';
import { Typography, Collapse, List, Avatar, Rate, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import summaryAtom from '../../states/summary';

const { Title, Text } = Typography;
const { Panel } = Collapse;

function VideoStoryline() {
  const navigate = useNavigate();

  const summaries = useAtomValue(summaryAtom);

  const handleBack = () => {
    navigate('/');
  };

  const handleNext = () => {
    navigate('/generate');
  };

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Title level={2}>Video Storyline</Title>
      <Text>Summary of video content</Text>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: '30px',
        }}
      >
        {/* Left Side: Collapsible List */}
        <div style={{ flex: 1, marginRight: '20px' }}>
          <Collapse accordion>
            {summaries.map((clip) => (
              <Panel header={clip.file.name} key={clip.file.name}>
                <List
                  dataSource={clip.segments}
                  renderItem={(segment) => (
                    <List.Item>
                      <Text>
                        {`${segment.startTimeSec.toFixed(2)} - ${segment.endTimeSec.toFixed(2)}: ${segment.description}`}
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

        {/* Right Side: Summaries */}
        <div style={{ flex: 1 }}>
          <List
            itemLayout="horizontal"
            dataSource={summaries}
            renderItem={(clip) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{clip.file.name[0]}</Avatar>}
                  title={clip.file.name}
                  description={clip.summary}
                />
                <Rate disabled defaultValue={clip.astheticRating || 0} />
              </List.Item>
            )}
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{ marginTop: '20px' }}>
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

export default VideoStoryline;
