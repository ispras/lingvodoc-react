export default function getParams(props) {
  const { perspectiveId, perspectiveParentId } = props;

  const result = {
    id: perspectiveId.map(k => parseInt(k, 10)),
    parent_id: perspectiveParentId.map(k => parseInt(k, 10)),
  };
  return result;
}
