/* eslint-disable jsx-a11y/media-has-caption */
import {
  Typography,
  List,
  Button,
  Space,
  Collapse,
  Input,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAtomValue, useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
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
  const videoClipRef = useRef<HTMLVideoElement>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [updatingStoryline, setUpdatingStoryline] = useState(false);

  const [selectedClip, setSelectedClip] = useState<number | null>(null);

  const handleBack = () => {
    navigate('/generate');
  };

  const generatePreview = async () => {
    setGeneratingPreview(true);
    const newPreview = await window.electron.ipcRenderer.invoke('gen-video', {
      storyline,
    });
    setGeneratingPreview(false);
    message.success('Video preview generated successfully');
    setPreviewAtom(newPreview);
  };

  const updateStoryline = async () => {
    setUpdatingStoryline(true);
    // TODO: Update the storyline based on the user input
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    message.success('Storyline updated successfully');
    setUpdatingStoryline(false);
  };

  const handleSave = async () => {
    try {
      if (!preview) {
        message.error('No video preview available to save.');
        return;
      }
      const result = await window.electron.saveVideo(preview);
      if (result.success) {
        message.success(`Video saved successfully to ${result.filePath}`);
      } else {
        message.error('Failed to save the video.');
      }
    } catch (error) {
      message.error('Failed to save the video.');
    }
  };

  useEffect(() => {
    const videoClip = videoClipRef.current;
    if (!videoClip) {
      return;
    }
    const segment = storyline.at(selectedClip ?? 0)!;
    const handleLoadedMetadata = () => {
      videoClip.currentTime = segment.startTimeSec;
    };

    // Monitor playback and stop/reset when the end time is reached
    const handleTimeUpdate = () => {
      if (videoClip.currentTime >= segment.endTimeSec) {
        videoClip.currentTime = segment.startTimeSec; // Optionally reset to the start time
      }
    };

    // Attach event listeners
    videoClip.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoClip.addEventListener('timeupdate', handleTimeUpdate);
  }, [selectedClip, storyline]);

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
            renderItem={(segment, index) => (
              <List.Item>
                <Text
                  onClick={() => {
                    setSelectedClip(selectedClip === index ? null : index);
                  }}
                >
                  <strong>[{segment.srcFile?.name || 'Summary'}]</strong>{' '}
                  {`${getTimeStamp(segment.startTimeSec)} - ${getTimeStamp(segment.endTimeSec)}`}{' '}
                  {segment.description}
                </Text>
              </List.Item>
            )}
          />
        </div>
      </div>

      {selectedClip !== null ? (
        <video
          ref={videoClipRef}
          controls
          autoPlay
          style={{
            width: '100%',
            maxWidth: '800px',
            height: '100%',
            backgroundColor: '#000',
          }}
        >
          <source
            src={`file://${storyline.at(selectedClip ?? 0)?.srcFile?.absolutePath}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      ) : (
        <Text>Click on a section on the right to preview</Text>
      )}

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
          onClick={() => updateStoryline()}
          loading={updatingStoryline}
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
        <Button
          type="primary"
          style={{
            marginTop: '10px',
            display: 'block', // Block element for full-width alignment
            marginLeft: 'auto', // Center-align button
            marginRight: 'auto',
          }}
          onClick={() => generatePreview()}
          loading={generatingPreview}
        >
          Generate Full Video
        </Button>
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
          {preview ? (
            <video
              controls
              autoPlay
              style={{
                width: '100%',
                maxWidth: '800px',
                height: '100%',
                backgroundColor: '#000',
              }}
            >
              <source src={`file://${preview}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Text>Video Preview Area</Text>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ marginTop: '30px' }}>
        <Space>
          <Button type="default" danger onClick={handleBack}>
            Back
          </Button>
          <Button type="primary" onClick={handleSave}>
            Save As
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default VideoSummary;
