from pydantic import BaseModel

class VideoFile:
    def __init__(self, absolutePath: str, name: str):
        self.absolutePath = absolutePath
        self.name = name

    def to_dict(self):
        return {
            "absolutePath": self.absolutePath,
            "name": self.name
        }


class Segment:
    def __init__(self, startTimeSec: int, endTimeSec: int, description: str, src_file: dict[str, str] = None):
        self.startTimeSec = startTimeSec
        self.endTimeSec = endTimeSec
        self.description = description
        self.src_file = src_file

    def to_dict(self):
        return {
            "startTimeSec": self.startTimeSec,
            "endTimeSec": self.endTimeSec,
            "description": self.description,
            "srcFile": self.src_file
        }


class VideoSummary:
    def __init__(self, file: VideoFile, summary: str, aesthetic_rating: int, segments: list[Segment]):
        self.file = file
        self.summary = summary
        self.aesthetic_rating = aesthetic_rating
        self.segments = segments

    def to_dict(self):
        return {
            "file": self.file.to_dict(),
            "summary": self.summary,
            "aestheticRating": self.aesthetic_rating,
            "segments": [segment.to_dict() for segment in self.segments]
        }

class Scene(BaseModel):
    story: str
    file_path: str
    start: int
    end: int

class Story(BaseModel):
    title: str
    whole_story: str
    scenes: list[Scene]

class Description(BaseModel):
    description: str
    aestheticRating: int
