import React, { useContext } from "react";
import { connect } from "react-redux";
import {
  Button,
  Checkbox,
  Header,
  Icon,
  Input,
  Loader,
  Message,
  Pagination,
  Popup,
  Segment,
  Select
} from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { DndContext, KeyboardSensor, PointerSensor, rectIntersection, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isEqual } from "lodash";
import { compose } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";

import "./style.scss";

const sourcePerspectiveQuery = gql`
  query sourcePerspectiveData {
    perspectives(with_valency_data: true) {
      id
      tree {
        id
        translations
        marked_for_deletion
      }
      has_adverb_data
      new_adverb_data_count
    }
  }
`;

export const adverbDataQuery = gql`
  query adverbData(
    $perspectiveId: LingvodocID!
    $offset: Int
    $limit: Int
    $specificityFlag: Boolean
    $adverbPrefix: String
    $caseFlag: Boolean
    $acceptValue: Boolean
    $sortOrderList: [String]
  ) {
    adverb_data(
      perspective_id: $perspectiveId
      offset: $offset
      limit: $limit
      specificity_flag: $specificityFlag
      adverb_prefix: $adverbPrefix
      case_flag: $caseFlag
      accept_value: $acceptValue
      sort_order_list: $sortOrderList
    )
  }
`;

const createAdverbDataMutation = gql`
  mutation createAdverbData($perspectiveId: LingvodocID!, $valencyKind: String!) {
    create_valency_data(perspective_id: $perspectiveId, valency_kind: $valencyKind) {
      triumph
    }
  }
`;

const setAdverbAnnotationMutation = gql`
  mutation setAdverbAnnotation($annotationList: [ValencyInstanceAnnotation]!, $valencyKind: String!) {
    set_valency_annotation(annotation_list: $annotationList, valency_kind: $valencyKind) {
      triumph
    }
  }
`;

const saveAdverbDataMutation = gql`
  mutation saveAdverbData($perspectiveId: LingvodocID!, $valencyKind: String!) {
    save_valency_data(perspective_id: $perspectiveId, valency_kind: $valencyKind) {
      triumph
      data_url
    }
  }
`;

const SortSpecificity = ({ valency, setState }) => {
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="sorting_item">
      <Checkbox
        label={getTranslation("Sort by specificity")}
        checked={valency.state.sort_specificity}
        onChange={(e, { checked }) => {
          setState({
            sort_specificity: checked,
            current_page: 1,
            input_go_to_page: 1,
            loading_adverb_data: true,
            loading_adverb_error: false,
            adverb_data: null
          });

          valency.queryAdverbData({
            current_page: 1,
            sort_specificity: checked
          });
        }}
      />
    </div>
  );
};

const SortAdverb = ({ valency, setState }) => {
  const getTranslation = useContext(TranslationContext);

  const { prefix_filter, data_adverb_prefix, show_data_adverb_list, show_prefix_adverb_list, show_prefix_str_list } =
    valency.state;

  return (
    <div className="sorting_item">
      <Checkbox
        label={getTranslation("Sort by adverbs")}
        checked={valency.state.sort_adverb}
        onChange={(e, { checked }) => {
          setState({
            sort_adverb: checked,
            current_page: 1,
            input_go_to_page: 1,
            loading_adverb_data: true,
            loading_adverb_error: false,
            adverb_data: null,
            prefix_filter: "",
            all_adverb_list: [],
            data_adverb_list: [],
            prefix_adverb_list: [],
            show_data_adverb_list: [],
            show_prefix_adverb_list: [],
            show_prefix_str_list: []
          });

          valency.queryAdverbData({
            current_page: 1,
            sort_adverb: checked,
            adverb_prefix: ""
          });
        }}
      />

      {valency.state.sort_adverb && (
        <Segment disabled={valency.state.loading_adverb_data} className="sort_adverb_selection">
          <div>
            {show_data_adverb_list.length > 0
              ? data_adverb_prefix
                ? `${getTranslation("Adverbs")} (${getTranslation("prefix")} "${data_adverb_prefix}"): `
                : `${getTranslation("Adverbs")}: `
              : data_adverb_prefix
              ? `${getTranslation("No adverbs")} (${getTranslation("prefix")} "${data_adverb_prefix}").`
              : `${getTranslation("No adverbs")}.`}

            {show_data_adverb_list.map((adverb, index) =>
              show_data_adverb_list.length > 15 && adverb == "..." ? (
                "..., "
              ) : (
                <span key={index} className="clickable" onClick={() => valency.setPrefix(adverb)}>
                  {adverb}
                  {index < show_data_adverb_list.length - 1 ? ", " : ""}
                </span>
              )
            )}

            {show_data_adverb_list.length > 0 &&
              ` (${valency.state.data_adverb_list.length} ${getTranslation("adverbs")})`}
          </div>

          <Input
            style={{ marginTop: "0.5em" }}
            placeholder={`${getTranslation("Adverb prefix filter")}...`}
            value={prefix_filter}
            onKeyPress={e => {
              if (e.key === "Enter") {
                valency.setPage(1);
              }
            }}
            onChange={e => valency.setPrefix(e.target.value)}
            icon={
              prefix_filter ? (
                <Icon name="delete" link onClick={() => valency.setPrefix("")} />
              ) : (
                <Icon name="delete" disabled />
              )
            }
          />

          {show_prefix_str_list.length > 0 && (
            <div style={{ marginTop: "0.5em" }}>
              {show_prefix_str_list.map((prefix, index) => (
                <span key={index} className="clickable" onClick={() => valency.setPrefix(prefix)}>
                  {prefix.charAt(0).toUpperCase() + prefix.substring(1)}
                  {index < show_prefix_str_list.length - 1 ? " " : ""}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: "0.5em" }}>
            {show_prefix_adverb_list.length > 0
              ? prefix_filter
                ? `${getTranslation("Filtered adverbs")} (${getTranslation("prefix")} "${prefix_filter}"): `
                : `${getTranslation("Filtered adverbs")}: `
              : prefix_filter
              ? `${getTranslation("No filtered adverbs")} (${getTranslation("prefix")} "${prefix_filter}").`
              : `${getTranslation("No filtered adverbs")}.`}

            {show_prefix_adverb_list.map((adverb, index) =>
              show_prefix_adverb_list.length > 15 && adverb == "..." ? (
                "..., "
              ) : (
                <span key={index} className="clickable" onClick={() => valency.setPrefix(adverb)}>
                  {adverb}
                  {index < show_prefix_adverb_list.length - 1 ? ", " : ""}
                </span>
              )
            )}

            {show_prefix_adverb_list.length > 0 &&
              ` (${valency.state.prefix_adverb_list.length} ${getTranslation("adverbs")})`}
          </div>

          <Button
            style={{ marginTop: "0.5em" }}
            basic
            compact
            disabled={prefix_filter == data_adverb_prefix}
            onClick={() => valency.setPage(1)}
          >
            {prefix_filter
              ? `${getTranslation("Apply filter")} (${getTranslation("prefix")} "${prefix_filter}")`
              : `${getTranslation("Apply filter")} (${getTranslation("no prefix")})`}
          </Button>
        </Segment>
      )}
    </div>
  );
};

const SortCase = ({ valency, setState }) => {
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="sorting_item">
      <Checkbox
        label={getTranslation("Sort by marks")}
        checked={valency.state.sort_case}
        onChange={(e, { checked }) => {
          setState({
            sort_case: checked,
            current_page: 1,
            input_go_to_page: 1,
            loading_adverb_data: true,
            loading_adverb_error: false,
            adverb_data: null
          });

          valency.queryAdverbData({
            current_page: 1,
            sort_case: checked
          });
        }}
      />
    </div>
  );
};

const SortAccept = ({ valency, setState }) => {
  const getTranslation = useContext(TranslationContext);

  const { sort_accept, accept_value } = valency.state;

  return (
    <div className="sorting_item">
      <Checkbox
        label={
          sort_accept ? (
            <label>
              {`${getTranslation("Sort by acceptance")} (${getTranslation(
                accept_value ? "accepted first" : "accepted last"
              )}) `}
            </label>
          ) : (
            getTranslation("Sort by acceptance")
          )
        }
        checked={sort_accept}
        onChange={(e, { checked }) => {
          setState({
            sort_accept: checked,
            current_page: 1,
            input_go_to_page: 1,
            loading_adverb_data: true,
            loading_adverb_error: false,
            adverb_data: null
          });

          valency.queryAdverbData({
            current_page: 1,
            sort_accept: checked
          });
        }}
      />
      {sort_accept && <span> </span>}
      {sort_accept && (
        <Icon
          name="sync alternate"
          className="clickable"
          onClick={() => {
            const new_accept_value = !accept_value;

            setState({
              current_page: 1,
              input_go_to_page: 1,
              loading_adverb_data: true,
              loading_adverb_error: false,
              adverb_data: null,
              accept_value: new_accept_value
            });

            valency.queryAdverbData({
              current_page: 1,
              accept_value: new_accept_value
            });
          }}
        />
      )}
    </div>
  );
};

const SortingItem = ({ sort_type, ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: sort_type,
    transition: {
      duration: 0,
      easing: "step-start"
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition
  };

  let sort_component = null;

  switch (sort_type) {
    case "specificity":
      sort_component = <SortSpecificity {...props} />;
      break;

    case "adverb":
      sort_component = <SortAdverb {...props} />;
      break;

    case "case":
      sort_component = <SortCase {...props} />;
      break;

    case "accept":
      sort_component = <SortAccept {...props} />;
      break;

    default:
      throw `unknown sorting type '${sort_type}'`;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {sort_component}
    </div>
  );
};

const Sorting = ({ sort_order_list, setSortOrder, ...props }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function collisionDetection({ active, droppableContainers, ...rest }) {
    return rectIntersection({
      active,
      droppableContainers: droppableContainers.filter(d => d.id != active.id),
      ...rest
    });
  }

  const { sort_accept, sort_case, sort_adverb, sort_specificity } = props.valency.state;

  return (
    <DndContext
      key={`${sort_accept}${sort_case}${sort_adverb}${sort_specificity}`}
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={collisionDetection}
      onDragEnd={setSortOrder}
    >
      <SortableContext items={sort_order_list} strategy={verticalListSortingStrategy}>
        {sort_order_list.map((sort_type, index) => (
          <SortingItem key={`${index}-${sort_type}`} sort_type={sort_type} {...props} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

class Adverb extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      perspective: null,

      sort_order_list: ["specificity", "adverb", "case", "accept"],

      sort_specificity: true,
      sort_adverb: false,
      sort_case: false,
      sort_accept: false,

      creating_adverb_data: false,
      creating_adverb_error: false,
      loading_adverb_data: false,
      loading_adverb_error: false,
      saving_adverb_data: false,
      saving_adverb_error: false,

      adverb_data: null,

      instance_count: null,
      current_page: 1,
      input_go_to_page: 1,
      items_per_page: 25,
      total_pages: null,

      instance_list: null,
      sentence_map: null,
      annotation_map: null,
      user_map: null,

      prefix_filter: "",
      all_adverb_list: [],
      data_adverb_list: [],
      data_adverb_prefix: "",
      prefix_adverb_list: [],
      show_data_adverb_list: [],
      show_prefix_adverb_list: [],
      show_prefix_str_list: [],

      accept_value: true,

      selection_default: false,
      selection_dict: {},

      downloadUrl: null
    };

    this.createAdverbData = this.createAdverbData.bind(this);
    this.saveAdverbData = this.saveAdverbData.bind(this);
    this.setAdverbAnnotation = this.setAdverbAnnotation.bind(this);
    this.acceptRejectAllSelected = this.acceptRejectAllSelected.bind(this);

    this.queryAdverbData = this.queryAdverbData.bind(this);

    this.setPerspective = this.setPerspective.bind(this);
    this.setPage = this.setPage.bind(this);
    this.setItemsPerPage = this.setItemsPerPage.bind(this);
    this.setPrefix = this.setPrefix.bind(this);

    this.getEnabledSortOrder = this.getEnabledSortOrder.bind(this);
    this.setSortOrder = this.setSortOrder.bind(this);

    this.render_instance = this.render_instance.bind(this);

    this.adverb_data_query_count = 0;
  }

  queryAdverbData({
    perspective = null,
    current_page = null,
    items_per_page = null,
    sort_specificity = null,
    sort_adverb = null,
    sort_case = null,
    sort_accept = null,
    adverb_prefix = null,
    accept_value = null,
    sort_order_list = null
  } = {}) {
    const { client } = this.props;

    perspective = perspective || this.state.perspective;

    if (current_page == null) {
      current_page = this.state.current_page;
    }

    items_per_page = items_per_page || this.state.items_per_page;

    if (sort_specificity == null) {
      sort_specificity = this.state.sort_specificity;
    }

    if (sort_adverb == null) {
      sort_adverb = this.state.sort_adverb;
    }

    if (sort_case == null) {
      sort_case = this.state.sort_case;
    }

    if (sort_accept == null) {
      sort_accept = this.state.sort_accept;
    }

    if (adverb_prefix == null && sort_adverb) {
      adverb_prefix = this.state.prefix_filter;
    }

    if (accept_value == null && sort_accept) {
      accept_value = this.state.accept_value;
    }

    if (sort_order_list == null) {
      sort_order_list = this.state.sort_order_list;
    }

    const query_index = ++this.adverb_data_query_count;

    client
      .query({
        query: adverbDataQuery,
        variables: {
          perspectiveId: perspective.id,
          offset: (current_page - 1) * items_per_page,
          limit: items_per_page,
          specificityFlag: sort_specificity,
          adverbPrefix: sort_adverb ? adverb_prefix : null,
          caseFlag: sort_case,
          acceptValue: sort_accept ? accept_value : null,
          sortOrderList: sort_order_list
        },
        fetchPolicy: "no-cache"
      })
      .then(
        ({ data }) => {
          if (query_index < this.adverb_data_query_count) {
            return;
          }

          const { instance_count, instance_list, sentence_list, annotation_list, user_list } = data.adverb_data;

          const sentence_map = new Map(sentence_list.map(sentence => [sentence.id, sentence]));

          const annotation_map = new Map(
            annotation_list.map(([instance_id, user_annotation_list]) => [instance_id, new Map(user_annotation_list)])
          );

          const user_map = new Map(user_list);

          const state_obj = {
            adverb_data: data.adverb_data,
            instance_count,
            total_pages: Math.floor((instance_count + items_per_page - 1) / items_per_page),
            instance_list,
            sentence_map,
            annotation_map,
            user_map,
            data_adverb_prefix: adverb_prefix,
            loading_adverb_data: false
          };

          if (sort_adverb) {
            const adverb_list = data.adverb_data.adverb_list;

            const all_adverb_list = [];
            const data_adverb_list = [];
            const prefix_adverb_list = [];

            for (const [adverb, has_prefix] of adverb_list) {
              all_adverb_list.push(adverb);

              if (has_prefix) {
                data_adverb_list.push(adverb);
                prefix_adverb_list.push(adverb);
              }
            }

            state_obj.all_adverb_list = all_adverb_list;
            state_obj.data_adverb_list = data_adverb_list;
            state_obj.prefix_adverb_list = prefix_adverb_list;

            let show_data_adverb_list = [];
            let show_prefix_adverb_list = [];

            if (data_adverb_list.length > 15) {
              for (const adverb of data_adverb_list.slice(0, 10)) {
                show_data_adverb_list.push(adverb);
              }

              show_data_adverb_list.push("...");

              for (const adverb of data_adverb_list.slice(-5)) {
                show_data_adverb_list.push(adverb);
              }
            } else {
              show_data_adverb_list = data_adverb_list;
            }

            if (prefix_adverb_list.length > 15) {
              for (const adverb of prefix_adverb_list.slice(0, 10)) {
                show_prefix_adverb_list.push(adverb);
              }

              show_prefix_adverb_list.push("...");

              for (const adverb of prefix_adverb_list.slice(-5)) {
                show_prefix_adverb_list.push(adverb);
              }
            } else {
              show_prefix_adverb_list = prefix_adverb_list;
            }

            state_obj.show_data_adverb_list = show_data_adverb_list;
            state_obj.show_prefix_adverb_list = show_prefix_adverb_list;

            const show_prefix_str_set = new Set();
            const show_prefix_str_list = [];

            const prefix_length = adverb_prefix.length;

            for (const adverb of prefix_adverb_list) {
              if (adverb.length < prefix_length) {
                continue;
              }

              const prefix_str = adverb.slice(0, prefix_length + 1);

              if (prefix_str.length > prefix_length && !show_prefix_str_set.has(prefix_str)) {
                show_prefix_str_set.add(prefix_str);
                show_prefix_str_list.push(prefix_str);
              }
            }

            state_obj.show_prefix_str_list = show_prefix_str_list;
          }

          this.setState(state_obj);
        },

        error => {
          this.setState({
            loading_adverb_data: false,
            loading_adverb_error: true
          });
        }
      );
  }

  setPerspective(perspective) {
    if (!perspective.has_adverb_data) {
      this.setState({
        perspective,
        sort_specificity: true,
        sort_adverb: false,
        sort_case: false,
        sort_accept: false,
        adverb_data: null,
        prefix_filter: "",
        selection_dict: {},
        downloadUrl: null
      });

      return;
    }

    this.setState({
      perspective,
      sort_specificity: true,
      sort_adverb: false,
      sort_case: false,
      sort_accept: false,
      adverb_data: null,
      prefix_filter: "",
      selection_dict: {},
      downloadUrl: null,
      loading_adverb_data: true,
      loading_adverb_error: false
    });

    this.queryAdverbData({
      perspective,
      current_page: 1,
      sort_specificity: true,
      sort_adverb: false,
      adverb_prefix: "",
      sort_case: false,
      sort_accept: false,
      accept_value: null
    });
  }

  createAdverbData() {
    this.setState({ creating_adverb_data: true });

    const { has_adverb_data } = this.state.perspective;

    this.props
      .createAdverbData({
        variables: {
          perspectiveId: this.state.perspective.id,
          valencyKind: 'adverb'
        }
      })
      .then(
        () => {
          window.logger.suc(this.context(has_adverb_data ? "Updated adverb data." : "Created adverb data."));

          const { client } = this.props;
          const id_str = client.cache.identify(this.state.perspective);

          const result = client.writeFragment({
            id: id_str,
            fragment: gql`
              fragment HasValencyData on DictionaryPerspective {
                has_adverb_data
                new_adverb_data_count
              }
            `,
            data: {
              has_adverb_data: true,
              new_adverb_data_count: 0
            }
          });

          const perspective = client.readFragment({
            id: id_str,
            fragment: gql`
              fragment Perspective on DictionaryPerspective {
                id
                tree {
                  id
                  translations
                  marked_for_deletion
                }
                has_adverb_data
                new_adverb_data_count
              }
            `
          });

          this.setState({
            perspective,
            current_page: 1,
            input_go_to_page: 1,
            creating_adverb_data: false,
            loading_adverb_data: true,
            loading_adverb_error: false,
            adverb_data: null
          });

          this.queryAdverbData({
            perspective,
            current_page: 1
          });
        },
        () => {
          this.setState({
            creating_adverb_data: false,
            creating_adverb_error: true
          });
        }
      );
  }

  saveAdverbData() {
    this.setState({
      saving_adverb_data: true,
      downloadUrl: null
    });

    this.props
      .saveAdverbData({
        variables: {
          perspectiveId: this.state.perspective.id,
          valencyKind: 'adverb'
        }
      })
      .then(
        ({
          data: {
            save_adverb_data: { data_url }
          }
        }) => {
          this.setState({
            saving_adverb_data: false,
            downloadUrl: data_url
          });

          this.downloadA.href = data_url;
          this.downloadA.click();
        },
        () => {
          this.setState({
            saving_adverb_data: false,
            saving_adverb_error: true
          });
        }
      );
  }

  setAdverbAnnotation(annotation_list) {
    this.props
      .setAdverbAnnotation({
        variables: {
          annotationList: annotation_list,
          valencyKind: 'adverb'
        }
      })
      .then(
        () => {
          window.logger.suc(this.context("Set adverb annotation."));

          for (const [instance_id, annotation_value] of annotation_list) {
            if (!this.state.annotation_map.has(instance_id)) {
              this.state.annotation_map.set(instance_id, new Map([[this.props.user.id, annotation_value]]));
            } else {
              this.state.annotation_map.get(instance_id).set(this.props.user.id, annotation_value);
            }

            if (!this.state.user_map.has(this.props.user.id)) {
              this.state.user_map.set(this.props.user.id, this.props.user.name);
            }
          }

          this.setState({
            annotation_map: this.state.annotation_map,
            downloadUrl: null
          });
        },
        () => {}
      );
  }

  acceptRejectAllSelected(accept_value) {
    const { annotation_map, selection_default, selection_dict } = this.state;

    const user_id = this.props.user.id;
    const annotation_list = [];

    for (const instance of this.state.instance_list) {
      const selected = selection_dict.hasOwnProperty(instance.id) ? selection_dict[instance.id] : selection_default;

      if (!selected) {
        continue;
      }

      const user_annotation_map = annotation_map.has(instance.id) ? annotation_map.get(instance.id) : null;

      const annotation_value =
        user_annotation_map && user_annotation_map.has(user_id) && user_annotation_map.get(user_id);

      if (annotation_value != accept_value) {
        annotation_list.push([instance.id, accept_value]);
      }
    }

    if (annotation_list.length > 0) {
      this.setAdverbAnnotation(annotation_list);
    }
  }

  setPage(active_page) {
    active_page = Math.max(1, Math.min(active_page, this.state.total_pages));

    this.setState({
      current_page: active_page,
      input_go_to_page: active_page,
      loading_adverb_data: true,
      loading_adverb_error: false,
      adverb_data: null
    });

    this.queryAdverbData({ current_page: active_page });
  }

  setItemsPerPage(items_per_page) {
    const current_page = Math.floor(((this.state.current_page - 1) * this.state.items_per_page) / items_per_page) + 1;

    this.setState({
      current_page,
      input_go_to_page: current_page,
      items_per_page,
      loading_adverb_data: true,
      loading_adverb_error: false,
      adverb_data: null
    });

    this.queryAdverbData({ current_page, items_per_page });
  }

  setPrefix(prefix_str) {
    let prefix_adverb_list = [];

    /* Refinement. */

    if (prefix_str.startsWith(this.state.prefix_filter)) {
      prefix_adverb_list = this.state.prefix_adverb_list.filter(adverb => adverb.startsWith(prefix_str));
    } else {
      /* Not a refinement, have to start from the list of all adverbs. */
      prefix_adverb_list = this.state.all_adverb_list.filter(adverb => adverb.startsWith(prefix_str));
    }

    let show_prefix_adverb_list = [];

    if (prefix_adverb_list.length > 15) {
      for (const adverb of prefix_adverb_list.slice(0, 10)) {
        show_prefix_adverb_list.push(adverb);
      }

      show_prefix_adverb_list.push("...");

      for (const adverb of prefix_adverb_list.slice(-5)) {
        show_prefix_adverb_list.push(adverb);
      }
    } else {
      show_prefix_adverb_list = prefix_adverb_list;
    }

    const show_prefix_str_set = new Set();
    const show_prefix_str_list = [];

    const prefix_length = prefix_str.length;

    for (const adverb of prefix_adverb_list) {
      if (adverb.length < prefix_length) {
        continue;
      }

      const new_prefix_str = adverb.slice(0, prefix_length + 1);

      if (new_prefix_str.length > prefix_length && !show_prefix_str_set.has(new_prefix_str)) {
        show_prefix_str_set.add(new_prefix_str);
        show_prefix_str_list.push(new_prefix_str);
      }
    }

    this.setState({
      prefix_filter: prefix_str,
      prefix_adverb_list,
      show_prefix_adverb_list,
      show_prefix_str_list
    });
  }

  getEnabledSortOrder(sort_order_list = null) {
    if (sort_order_list == null) {
      sort_order_list = this.state.sort_order_list;
    }

    const condition_dict = {
      specificity: this.state.sort_specificity,
      adverb: this.state.sort_adverb,
      case: this.state.sort_case,
      accept: this.state.sort_accept
    };

    return sort_order_list.filter(sort_type => condition_dict[sort_type]);
  }

  setSortOrder(event) {
    const { active, over } = event;

    if (!active || !over || active.id == over.id) {
      return;
    }

    const { sort_order_list } = this.state;

    const enabled_before_list = this.getEnabledSortOrder(sort_order_list);

    const oldIndex = sort_order_list.indexOf(active.id);
    const newIndex = sort_order_list.indexOf(over.id);

    const new_sort_order_list = arrayMove(sort_order_list, oldIndex, newIndex);

    const enabled_after_list = this.getEnabledSortOrder(new_sort_order_list);

    this.setState({ sort_order_list: new_sort_order_list });

    // Reloading data only if the order of _enabled_ sorting options is changed.

    if (!isEqual(enabled_before_list, enabled_after_list)) {
      this.queryAdverbData({
        current_page: 1,
        sort_order_list: new_sort_order_list
      });
    }
  }

  render_instance(instance) {
    const sentence = this.state.sentence_map.get(instance.sentence_id);

    const instance_data = sentence.instances_adv[instance.index];

    const instance_case = instance_data["case"];
    const [instance_from, instance_to] = instance_data["location"];

    const annotation_map = this.state.annotation_map;
    const user_id = this.props.user.id;

    const user_annotation_map = annotation_map.has(instance.id) ? annotation_map.get(instance.id) : null;

    const annotation_value =
      user_annotation_map && user_annotation_map.has(user_id) && user_annotation_map.get(user_id);

    const { selection_default, selection_dict } = this.state;

    return (
      <Segment key={instance.id}>
        <Checkbox
          style={{ marginRight: "0.5em", verticalAlign: "middle" }}
          checked={selection_dict.hasOwnProperty(instance.id) ? selection_dict[instance.id] : selection_default}
          onChange={(e, { checked }) => {
            selection_dict[instance.id] = checked;
            this.setState({ selection_dict });
          }}
        />

        {sentence.tokens.map((token, index) => {
          const item_list = Object.entries(token)
            .filter(item => item[0] != "token")
            .sort();

          const token_content =
            index == instance_from ? (
              <span>
                <span className="token_from">{token.token}</span>
                <span> </span>
              </span>
            ) : index == instance_to ? (
              <span>
                <span className="token_to">{token.token}</span>
                <span> </span>
                <span className="token_case">{instance_case.toUpperCase()}</span>
                <span> </span>
              </span>
            ) : (
              <span key={index}>{token.token} </span>
            );

          return item_list.length > 0 ? (
            <Popup key={`${index}${token}`} trigger={token_content} basic flowing>
              {item_list.map(item => (
                <div key={item[0]}>
                  {item[0]}: {item[1]}
                </div>
              ))}
            </Popup>
          ) : (
            <span key={`${index}${token}`}>{token_content}</span>
          );
        })}

        <br />

        <div style={{ marginTop: "0.5em" }}>
          <Button.Group>
            <Button
              basic
              compact
              positive
              content={this.context("Accept")}
              disabled={annotation_value}
              onClick={() => this.setAdverbAnnotation([[instance.id, true]])}
            />

            <Button
              basic
              compact
              color="blue"
              content={this.context("Reject")}
              disabled={!annotation_value}
              onClick={() => this.setAdverbAnnotation([[instance.id, false]])}
            />
          </Button.Group>

          {annotation_value && <span style={{ marginLeft: "0.5em" }}>{this.context("Accepted")}</span>}
        </div>

        {user_annotation_map && user_annotation_map.size > 0 && (
          <div style={{ marginTop: "0.5em" }}>
            {Array.from(user_annotation_map.entries())
              .filter(([annotation_user_id, annotation_value]) => annotation_value)
              .map(([annotation_user_id, annotation_value]) => [
                this.state.user_map.get(annotation_user_id),
                annotation_user_id
              ])
              .sort()
              .map(([user_name, user_id]) => (
                <div key={user_id} style={{ marginTop: "0.25em" }}>
                  {`${this.context("Accepted by")} ${user_name}`}
                </div>
              ))}
          </div>
        )}
      </Segment>
    );
  }

  render() {
    if (this.props.error) {
      return (
        <div className="background-content">
          <Message compact negative>
            {this.context("User sign-in error, please sign in; if not successful, please contact administrators.")}
          </Message>
        </div>
      );
    } else if (this.props.loading) {
      return (
        <div className="background-content">
          <Segment>
            <Loader active inline="centered" indeterminate>
              {`${this.context("Loading sign-in data")}...`}
            </Loader>
          </Segment>
        </div>
      );
    } else if (this.props.user.id === undefined) {
      return (
        <div className="background-content">
          <Message>
            <Message.Header>{this.context("Please sign in")}</Message.Header>
            <p>{this.context("Only registered users can work with adverb data.")}</p>
          </Message>
        </div>
      );
    } else if (this.props.data.error) {
      return (
        <div className="background-content">
          <Message compact negative>
            {this.context("General error, please contact administrators.")}
          </Message>
        </div>
      );
    } else if (this.props.data.loading) {
      return (
        <div className="background-content">
          <Segment>
            <Loader active inline="centered" indeterminate>
              {this.context("Loading perspective data")}...
            </Loader>
          </Segment>
        </div>
      );
    }

    const { perspectives } = this.props.data;

    const perspective_option_list = [];
    const perspective_id_map = new Map();

    for (let i = 0; i < perspectives.length; i++) {
      if (perspectives[i].tree.some(value => value.marked_for_deletion)) {
        continue;
      }

      const id_str = id2str(perspectives[i].id);

      const text_str = perspectives[i].tree
        .map(value => T(value.translations))
        .reverse()
        .join(" \u203a ");

      perspective_option_list.push({
        key: i,
        value: id_str,
        text: text_str
      });

      perspective_id_map.set(id_str, perspectives[i]);
    }

    const {
      perspective,

      current_page,
      items_per_page,
      show_data_adverb_list,
      show_prefix_adverb_list,
      show_prefix_str_list,

      annotation_map,
      selection_default,
      selection_dict
    } = this.state;

    const user_id = this.props.user.id;

    const render_instance_list = [];

    let has_selected_to_accept = false;
    let has_selected_to_reject = false;

    if (!this.state.loading_adverb_data && this.state.adverb_data && this.state.instance_list.length > 0) {
      const prev_dict = {
        specificity: null,
        adverb: null,
        case: null,
        accept: null
      };

      /* Showing accepted / not accepted headers only if some other sorting option is enabled and goes after
       * 'sort by acceptance' in the sorting option order. */

      let enabled_list = this.getEnabledSortOrder();
      let accept_header_flag = false;

      if (this.state.sort_accept) {
        let seen_accept = false;

        for (const sort_type of enabled_list) {
          if (sort_type == "accept") {
            seen_accept = true;
          } else if (seen_accept) {
            accept_header_flag = true;
            break;
          }
        }
      }

      if (!accept_header_flag) {
        enabled_list = enabled_list.filter(sort_type => sort_type != "accept");
      }

      /* Checks if instance is accepted by at least 1 user. */

      function is_instance_accepted(instance) {
        const instance_id = instance.id;

        if (annotation_map.has(instance_id)) {
          for (const value of annotation_map.get(instance_id).values()) {
            if (value) {
              return true;
            }
          }
        }
      }

      for (const sort_type of enabled_list) {
        switch (sort_type) {
          case "specificity":
            break;

          case "adverb":
            const { adverb_lex } = this.state.instance_list[0];

            render_instance_list.push(
              <Header key={`${render_instance_list.length}${adverb_lex}`}>{adverb_lex}</Header>
            );
            prev_dict[sort_type] = adverb_lex;

            break;

          case "case":
            const { case_str } = this.state.instance_list[0];

            render_instance_list.push(
              <Header key={`${render_instance_list.length}${case_str}`}>{case_str.toUpperCase()}</Header>
            );

            prev_dict[sort_type] = case_str;

            break;

          case "accept":
            const accept_str = is_instance_accepted(this.state.instance_list[0])
              ? this.context("Accepted")
              : this.context("Not accepted");

            render_instance_list.push(
              <Header key={`${render_instance_list.length}${accept_str}`}>{accept_str}</Header>
            );

            prev_dict[sort_type] = accept_str;

            break;

          default:
            throw `unknown sorting type '${sort_type}'`;
        }
      }

      for (let i = 0; i < this.state.instance_list.length; i++) {
        const instance = this.state.instance_list[i];

        for (let j = 0; j < enabled_list.length; j++) {
          const sort_type = enabled_list[j];

          switch (sort_type) {
            case "specificity":
              break;

            case "adverb":
              const { adverb_lex } = instance;

              if (adverb_lex != prev_dict[sort_type]) {
                render_instance_list.push(
                  <Header key={`${render_instance_list.length}${adverb_lex}`}>{adverb_lex}</Header>
                );

                prev_dict[sort_type] = adverb_lex;

                for (let k = j + 1; k < enabled_list.length; k++) {
                  prev_dict[enabled_list[k]] = null;
                }
              }

              break;

            case "case":
              const { case_str } = instance;

              if (case_str != prev_dict[sort_type]) {
                render_instance_list.push(
                  <Header key={`${render_instance_list.length}${case_str}`}>{case_str.toUpperCase()}</Header>
                );

                prev_dict[sort_type] = case_str;

                for (let k = j + 1; k < enabled_list.length; k++) {
                  prev_dict[enabled_list[k]] = null;
                }
              }

              break;

            case "accept":
              const accept_str = is_instance_accepted(instance)
                ? this.context("Accepted")
                : this.context("Not accepted");

              if (accept_str != prev_dict[sort_type]) {
                render_instance_list.push(
                  <Header key={`${render_instance_list.length}${accept_str}`}>{accept_str}</Header>
                );

                prev_dict[sort_type] = accept_str;

                for (let k = j + 1; k < enabled_list.length; k++) {
                  prev_dict[enabled_list[k]] = null;
                }
              }

              break;

            default:
              throw `unknown sorting type '${sort_type}'`;
          }
        }

        render_instance_list.push(this.render_instance(instance));

        /* Checking if we have selected instances we can accept/reject. */

        if (has_selected_to_accept && has_selected_to_reject) {
          continue;
        }

        const selected = selection_dict.hasOwnProperty(instance.id) ? selection_dict[instance.id] : selection_default;

        if (!selected) {
          continue;
        }

        const user_annotation_map = annotation_map.has(instance.id) ? annotation_map.get(instance.id) : null;

        const annotation_value =
          user_annotation_map && user_annotation_map.has(user_id) && user_annotation_map.get(user_id);

        if (annotation_value) {
          has_selected_to_reject = true;
        } else {
          has_selected_to_accept = true;
        }
      }
    }

    return (
      <div className="background-content">
        <Segment>
          <div style={{ marginBottom: "0.5em" }}>{this.context("Perspective")}:</div>

          <Select
            fluid
            placeholder={this.context("Please select perspective.")}
            search
            options={perspective_option_list}
            onChange={(e, { value }) => this.setPerspective(perspective_id_map.get(value))}
          />

          {perspective && (
            <div style={{ marginTop: "0.5em" }}>
              {(!perspective.has_adverb_data || perspective.new_adverb_data_count > 0) && (
                <Button
                  key={perspective.has_adverb_data ? "_update" : "_create"}
                  style={{ marginRight: "0.5em" }}
                  basic
                  color={perspective.has_adverb_data ? "violet" : "green"}
                  content={
                    this.state.creating_adverb_data ? (
                      <span>
                        {this.context(
                          perspective.has_adverb_data ? "Updating adverb data..." : "Creating adverb data..."
                        )}
                        <Icon name="spinner" loading />
                      </span>
                    ) : (
                      this.context(perspective.has_adverb_data ? "Update adverb data" : "Create adverb data")
                    )
                  }
                  disabled={!perspective || this.state.creating_adverb_data}
                  onClick={() => this.createAdverbData()}
                />
              )}

              {perspective.has_adverb_data && false && (
                <Button
                  key="_save"
                  style={{ marginRight: "0.5em" }}
                  basic
                  color="blue"
                  content={
                    this.state.saving_adverb_data ? (
                      <span>
                        {this.context("Saving adverb data")}... <Icon name="spinner" loading />
                      </span>
                    ) : (
                      this.context("Save adverb data")
                    )
                  }
                  disabled={!perspective || this.state.saving_adverb_data}
                  onClick={() => this.saveAdverbData()}
                />
              )}

              <a
                style={this.state.downloadUrl ? { marginLeft: "0.5em" } : { display: "none" }}
                href={this.state.downloadUrl}
                ref={e => (this.downloadA = e)}
              >
                {this.context("Adverb data")}
              </a>
            </div>
          )}

          {(this.state.adverb_data || this.state.loading_adverb_data) && (
            <div style={{ marginTop: "0.5em" }}>
              <Checkbox
                toggle
                label={`${this.context("Selected by default")}: ${
                  this.state.selection_default ? this.context("on") : this.context("off")
                }`}
                checked={this.state.selection_default}
                onChange={(e, data) => this.setState({ selection_default: data.checked })}
              />
            </div>
          )}

          {(this.state.adverb_data || this.state.loading_adverb_data) && (
            <Sorting
              sort_order_list={this.state.sort_order_list}
              setSortOrder={this.setSortOrder}
              valency={this}
              setState={state => this.setState(state)}
            />
          )}

          {this.state.loading_adverb_data && (
            <div style={{ marginTop: "1em" }}>
              <span>
                {`${this.context("Loading adverb data...")} `}
                <Icon name="spinner" loading />
              </span>
            </div>
          )}

          {!this.state.loading_adverb_data && this.state.adverb_data && (
            <div style={{ marginTop: "1em" }}>
              {this.state.instance_list.length <= 0 ? (
                <p>{`${this.context("No instances")}.`}</p>
              ) : (
                <div>
                  <p>
                    {`${this.context("Instances")} `}({(current_page - 1) * items_per_page + 1}-
                    {Math.min(current_page * items_per_page, this.state.instance_count)}/{this.state.instance_count}):
                  </p>

                  <Pagination
                    activePage={this.state.current_page}
                    totalPages={this.state.total_pages}
                    siblingRange={2}
                    onPageChange={(e, { activePage }) => this.setPage(activePage)}
                  />

                  <span style={{ marginLeft: "1em" }}>{`${this.context("Go to page")}:`}</span>

                  <Input
                    style={{ marginLeft: "0.5em", maxWidth: "7.5em" }}
                    min={1}
                    max={this.state.total_pages}
                    type="number"
                    defaultValue={this.state.input_go_to_page}
                    onChange={(e, { value }) => {
                      this.state.input_go_to_page = value;
                    }}
                    onKeyPress={e => {
                      if (e.key === "Enter") {
                        this.setPage(this.state.input_go_to_page);
                      }
                    }}
                  />

                  <Button
                    style={{ paddingLeft: "0.75em", paddingRight: "0.75em" }}
                    basic
                    content={this.context("Go")}
                    onClick={() => this.setPage(this.state.input_go_to_page)}
                    attached="right"
                  />

                  <span style={{ marginLeft: "1em" }}>{`${this.context("Items per page")}:`}</span>

                  <Select
                    style={{ marginLeft: "0.5em", minWidth: "7.5em" }}
                    value={items_per_page.toString()}
                    options={[
                      { value: "25", text: "25" },
                      { value: "50", text: "50" },
                      { value: "100", text: "100" }
                    ]}
                    onChange={(e, { value }) => this.setItemsPerPage(parseInt(value))}
                  />
                </div>
              )}

              {render_instance_list}

              {this.state.instance_list.length > 0 && (
                <div>
                  <Button.Group>
                    <Button
                      style={{ marginBottom: "1em" }}
                      basic
                      compact
                      positive
                      disabled={!has_selected_to_accept}
                      content={this.context("Accept all selected")}
                      onClick={() => this.acceptRejectAllSelected(true)}
                    />
                    <Button
                      style={{ marginBottom: "1em" }}
                      basic
                      compact
                      color="blue"
                      disabled={!has_selected_to_reject}
                      content={this.context("Reject all selected")}
                      onClick={() => this.acceptRejectAllSelected(false)}
                    />
                  </Button.Group>

                  <br />

                  <Pagination
                    activePage={this.state.current_page}
                    totalPages={this.state.total_pages}
                    siblingRange={2}
                    onPageChange={(e, { activePage }) => this.setPage(activePage)}
                  />

                  <span style={{ marginLeft: "1em" }}>{`${this.context("Go to page")}:`}</span>

                  <Input
                    style={{ marginLeft: "0.5em", maxWidth: "7.5em" }}
                    min={1}
                    max={this.state.total_pages}
                    type="number"
                    defaultValue={this.state.input_go_to_page}
                    onChange={(e, { value }) => {
                      this.state.input_go_to_page = value;
                    }}
                    onKeyPress={e => {
                      if (e.key === "Enter") {
                        this.setPage(this.state.input_go_to_page);
                      }
                    }}
                  />

                  <Button
                    style={{ paddingLeft: "0.75em", paddingRight: "0.75em" }}
                    basic
                    content={this.context("Go")}
                    onClick={() => this.setPage(this.state.input_go_to_page)}
                    attached="right"
                  />
                </div>
              )}
            </div>
          )}
        </Segment>
      </div>
    );
  }
}

Adverb.contextType = TranslationContext;

export default compose(
  connect(state => state.user),
  graphql(sourcePerspectiveQuery, { skip: ({ user }) => user.id === undefined }),
  graphql(createAdverbDataMutation, { name: "createAdverbData" }),
  graphql(saveAdverbDataMutation, { name: "saveAdverbData" }),
  graphql(setAdverbAnnotationMutation, { name: "setAdverbAnnotation" }),
  withApollo
)(Adverb);
