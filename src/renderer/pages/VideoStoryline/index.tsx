import React from 'react';
import { Typography, Collapse, List, Avatar, Rate, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Updated dummy data
const dummyClips = [
  {
    title: 'Clip1',
    summary: 'Summary of clip1',
    rating: 4,
    timeline: [
      '00:00 - 00:20 展示户外秋天的场景',
      '00:20 - 01:30 5个人在打篮球',
      '01:30 - 02:10 展示有绿色植物的校园环境',
      '02:10 - 02:50 展示蓝色天空和大面积湖水',
      '02:50 - 03:20 展示校园和大量行人',
    ],
  },
  {
    title: 'Clip2',
    summary: 'Summary of clip2',
    rating: 3,
    timeline: [
      '00:00 - 00:30 Scene with morning light',
      '00:30 - 01:00 Overview of the campus library',
      '01:00 - 01:30 Students walking through corridors',
    ],
  },
  {
    title: 'Clip3',
    summary: 'Summary of clip3',
    rating: 5,
    timeline: ['00:00 - 01:00 A panoramic view of the city'],
  },
  {
    title: 'Clip4',
    summary: 'Summary of clip4',
    rating: 4,
    timeline: [
      '00:00 - 00:30 Intro scene with music',
      '00:30 - 01:00 Main content',
    ],
  },
  {
    title: 'Clip5',
    summary: 'Summary of clip5',
    rating: 2,
    timeline: ['00:00 - 00:50 Experimental footage'],
  },
];

function VideoStoryline() {
  const navigate = useNavigate();
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
            {dummyClips.map((clip, index) => (
              <Panel header={clip.title} key={index}>
                <List
                  dataSource={clip.timeline}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
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
            dataSource={dummyClips}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{item.title[0]}</Avatar>}
                  title={item.title}
                  description={item.summary}
                />
                <Rate disabled defaultValue={item.rating} />
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
          <Button type="primary" onClick={handleNext}>Next</Button>
        </Space>
      </div>
    </div>
  );
}

export default VideoStoryline;
