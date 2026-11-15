import { Checkbox, Typography } from 'antd';
import { skillId, topicSkillIds, type Phase, type Topic } from '../data/roadmap';
import { useProgress } from '../progress';

export default function SkillChecklist({ phase, topic }: { phase: Phase; topic: Topic }) {
  const { isDone, toggle, setMany, countDone } = useProgress();
  const ids = topicSkillIds(phase.id, topic);
  const doneCount = countDone(ids);
  const allChecked = doneCount === ids.length;

  return (
    <>
      <Checkbox
        indeterminate={doneCount > 0 && !allChecked}
        checked={allChecked}
        onChange={(e) => setMany(ids, e.target.checked)}
        style={{ marginBottom: 4 }}
      >
        <Typography.Text strong>Kỹ năng cần đạt</Typography.Text>
      </Checkbox>
      <div style={{ paddingLeft: 24 }}>
        {topic.skills.map((skill, i) => {
          const id = skillId(phase.id, topic.id, i);
          const checked = isDone(id);
          return (
            <div className="skill-item" key={id}>
              <Checkbox checked={checked} onChange={(e) => toggle(id, e.target.checked)}>
                <span className={checked ? 'skill-done' : undefined}>{skill}</span>
              </Checkbox>
            </div>
          );
        })}
      </div>
    </>
  );
}
