import { Segmented } from 'antd';
import { tracks, type TrackId } from '../data/roadmap';
import { useTrack } from '../track';

interface Props {
  block?: boolean;
  vertical?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export default function TrackSwitch({ block, vertical, size }: Props) {
  const { track, setTrack } = useTrack();
  return (
    <Segmented<TrackId>
      block={block}
      vertical={vertical}
      size={size}
      value={track.id}
      onChange={setTrack}
      options={tracks.map((t) => ({ value: t.id, label: t.name }))}
    />
  );
}
