export type VisionMission = {
  title: string;
  content: string;
  imageUrl: string;
};

export type Collaborator = {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
};

export type CommentItem = {
  id: string;
  author: string;
  text: string;
  visible: boolean;
};

export type InformationalPage = {
  vision: VisionMission;
  mission: VisionMission;
  collaborators: Collaborator[];
  comments: CommentItem[];
};
