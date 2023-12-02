import { Button, Card, Empty, Input, Slider, Switch, Tag, Toast, Tooltip } from '@douyinfe/semi-ui';
import './App.css';
import { bitable, ITable, FieldType, IOpenSegment, IField } from "@lark-base-open/js-sdk";
import React, { useState, useEffect, } from 'react';
import { Select, Typography } from '@douyinfe/semi-ui';
import { IconSmallTriangleDown } from '@douyinfe/semi-icons'
import { useTranslation } from 'react-i18next';
import { IllustrationConstruction, IllustrationConstructionDark } from '@douyinfe/semi-illustrations';
const Actions = {
  None: -1,
  AppendToLeft: 0,
  AppendToRight: 1,
  Replace: 2
}
const IndexType = {
  Number: 0,
  Letters: 1,
  Chinese: 2,
}

export default function App() {
  const [curFieldId, setCurField] = useState<string>("");
  const [table, setTable] = useState<ITable>()
  const [curAction, setCurAction] = useState(Actions.None)
  useEffect(() => {
    const fn = async () => {
      bitable.base.getActiveTable().then(table => setTable(table))
      bitable.base.onSelectionChange(async (e) => {
        if (table?.id === e.data.tableId) { return }
        bitable.base.getActiveTable().then(table => setTable(table))
      })
    };
    fn();
  }, []);


  return (
    <main className="main">
      <FieldSelect table={table} onSelect={setCurField}></FieldSelect>
      <ActionSelect onSelect={setCurAction}></ActionSelect>
      <Workspace table={table} fieldId={curFieldId} action={curAction}></Workspace>
    </main >
  )
}
const FieldSelect: React.FC<{ table: ITable | undefined, onSelect: React.Dispatch<React.SetStateAction<string>> }> = ({ table, onSelect }) => {
  const { t } = useTranslation()
  const [fields, setFields] = useState<Array<{ value: string, label: string }>>([])
  const [curValue, setCurValue] = useState<string | undefined>()
  const [idToName, _] = useState(new Map<string, string>())
  useEffect(() => {
    const getFields = async (m: Map<string, string>) => {
      if (table === undefined) { return }
      setCurValue(undefined)
      setFields([])
      m.clear()
      let result: Array<{ value: string, label: string }> = []
      let fields = await table.getFieldListByType(FieldType.Text)
      for (let i = 0; i < fields.length; i++) {
        const e = fields[i];
        let name = await e.getName()
        m.set(e.id, name)
        result.push({
          label: name,
          value: e.id,
        })
      }
      setFields(result)
    }
    if (table !== undefined) {
      table.onFieldAdd(() => { getFields(idToName) })
      table.onFieldDelete(() => { getFields(idToName) })
      table.onFieldModify(() => { getFields(idToName) })
    }
    getFields(idToName)
  }, [table])
  const onChange = (value: string | number | any[] | Record<string, any> | undefined) => {
    setCurValue(idToName.get(value as string))
    onSelect(value as string)
  }
  return (<Select className='mainItem'
    style={{ width: "100%" }}
    insetLabel={t("fieldSelect.insetLabel")}
    clickToHide={true}
    value={curValue}
    placeholder={t("fieldSelect.placeholder")}
    optionList={fields}
    emptyContent={t("fieldSelect.emptyContent")}
    onChange={onChange}>
  </Select >)
}
const ActionSelect: React.FC<{ onSelect: React.Dispatch<React.SetStateAction<number>> }> = ({ onSelect }) => {
  const { t } = useTranslation()
  return (
    <Select className='mainItem'
      style={{ width: "100%" }}
      insetLabel={t("actionSelect.insetLabel")}
      placeholder={t("actionSelect.placeholder")}
      clickToHide={true}
      onChange={value => onSelect(value as number)}
    >
      <Select.Option
        label={t("actionSelect.optionAppendToLeft")}
        value={Actions.AppendToLeft}
      />
      <Select.Option
        label={t("actionSelect.optionAppendToRight")}
        value={Actions.AppendToRight}
      />
      <Select.Option
        label={t("actionSelect.optionReplace")}
        value={Actions.Replace}
      />
    </Select>
  )
}
const Workspace: React.FC<{ table: ITable | undefined, fieldId: string, action: number }> = ({ table, fieldId, action }) => {
  const { t } = useTranslation()
  useEffect(() => { }, [fieldId, action])
  if (table === undefined) {
    return (<Empty style={{ marginTop: "4rem" }}
      image={<IllustrationConstruction style={{ width: 150, height: 150 }} />}
      darkModeImage={<IllustrationConstructionDark style={{ width: 150, height: 150 }} />}
      title={t("workspace.emptyTable.title")}
      description={t("workspace.emptyTable.description")}
    />)
  }
  if (fieldId === "") {
    return (<Empty style={{ marginTop: "4rem" }}
      image={<IllustrationConstruction style={{ width: 150, height: 150 }} />}
      darkModeImage={<IllustrationConstructionDark style={{ width: 150, height: 150 }} />}
      title={t("workspace.emptyFieldId.title")}
      description={t("workspace.emptyFieldId.description")}
    />)
  }

  switch (action) {
    case Actions.Replace:
      return (<div className='mainItem'><WorkspaceReplace table={table} fieldId={fieldId}></WorkspaceReplace></div>)
    case Actions.AppendToLeft:
      return (<div className='mainItem'><WorkspaceAppend table={table} fieldId={fieldId} side="left"></WorkspaceAppend></div>)
    case Actions.AppendToRight:
      return (<div className='mainItem'><WorkspaceAppend table={table} fieldId={fieldId} side="right"></WorkspaceAppend></div>)
    case Actions.None:
    default:
      return (<div className='mainItem'><WorkspaceNone></WorkspaceNone></div>)
  }
}
const WorkspaceNone: React.FC = () => {
  const { t } = useTranslation()
  return (
    <div className='workspace'>
      <Empty style={{ marginTop: "3rem" }}
        image={<IllustrationConstruction style={{ width: 150, height: 150 }} />}
        darkModeImage={<IllustrationConstructionDark style={{ width: 150, height: 150 }} />}
        title={t("workspaceNone.title")}
        description={t("workspaceNone.description")}
      />
    </div>
  )
}
const WorkspaceReplace: React.FC<{ table: ITable, fieldId: string }> = ({ table, fieldId }) => {
  const { t } = useTranslation()
  const [isDisable, setDisable] = useState(false)

  const [indexConfig, setIndexConfig] = useState({
    enable: false,
    position: 0,
    type: IndexType.Number
  })

  const [newValue, setNewValue] = useState("")
  const startWork = () => {
    setDisable(true)
  }
  const stopWork = () => {
    setDisable(false)
  }
  const start = async (table: ITable, fieldId: string) => {
    if (fieldId === "") {
      Toast.info(t("workspace.emptyFieldIdToast"))
      return
    }
    EditFields(table, fieldId, startWork, stopWork,
      (_, index) => {
        let newText = newValue
        if (indexConfig.enable) {
          newText = newText.substring(0, indexConfig.position)
            + NumberToIndexString(index + 1, indexConfig.type)
            + newValue.substring(indexConfig.position)
        }
        return newText
      }
    )
  }
  return (
    <div className='workspace'>
      <Input
        disabled={isDisable}
        placeholder={t("workspace.Replace.input.placeholder")}
        onChange={setNewValue}
      ></Input>
      <IndexReview text={newValue} disable={isDisable} onChange={(enable, position, type) => {
        setIndexConfig({ enable: enable, position: position, type: type })
      }}></IndexReview>
      <Button
        style={{
          width: "100%"
        }}
        loading={isDisable}
        onClick={_ => start(table, fieldId)}>{t("workspace.startButton")}
      </Button>
    </div>
  )
}
const WorkspaceAppend: React.FC<{ table: ITable, fieldId: string, side: "left" | "right" }> = ({ table, fieldId, side }) => {
  const { t } = useTranslation()
  const [isDisable, setDisable] = useState(false)

  const [indexConfig, setIndexConfig] = useState({
    enable: false,
    position: 0,
    type: IndexType.Number
  })

  const [newValue, setNewValue] = useState("")

  const startWork = () => {
    setDisable(true)
  }
  const stopWork = () => {
    setDisable(false)
  }
  const start = async (table: ITable, fieldId: string, side: "left" | "right") => {
    if (fieldId === "") {
      Toast.info(t("workspace.emptyFieldIdToast"))
      return
    }
    EditFields(table, fieldId, startWork, stopWork,
      (oldValue, index) => {
        let result = oldValue
        let newText = newValue
        if (indexConfig.enable) {
          newText =
            newText.substring(0, indexConfig.position)
            + NumberToIndexString(index + 1, indexConfig.type)
            + newValue.substring(indexConfig.position)
        }
        if (side === "left") {
          result = newText + result
        } else {
          result = result + newText
        }
        return result
      }
    )
  }

  return (
    <div className='workspace'>
      <Input
        disabled={isDisable}
        placeholder={t("workspaceAppend.input.placeholder")}
        onChange={setNewValue}
      ></Input>
      <IndexReview text={newValue} disable={isDisable} onChange={(enable, position, type) => {
        setIndexConfig({ enable: enable, position: position, type: type })
      }}></IndexReview>
      <Button
        style={{
          width: "100%"
        }}
        loading={isDisable}
        onClick={_ => start(table, fieldId, side)}>{t("workspace.startButton")}</Button>
    </div>
  )
}

const IndexReview: React.FC<{ text: string, disable: boolean, onChange: (enable: boolean, index: number, indexType: number) => void }> = ({ text, disable = false, onChange }) => {
  const { t } = useTranslation()
  const [isDisable, setDisable] = useState(false)
  const [indexReviewLeft, setIndexReviewLeft] = useState("")
  const [indexReviewRight, setIndexReviewRight] = useState("")
  const [sliderValue, setSliderValue] = useState(1)

  const [isAddIndex, setIsAddIndex] = useState(false)
  const [indexType, setIndexType] = useState(0)
  const [indexPosition, setIndexPosition] = useState(0)
  useEffect(() => {
    updateIndexRevew(sliderValue)
  }, [text])
  useEffect(() => {
    setDisable(disable)
  }, [disable])
  const updateIndexRevew = (v: number) => {
    const i = 100 / v
    const leftLength = text.length / i
    setIndexReviewLeft("|" + text.substring(0, leftLength))
    setIndexReviewRight(text.substring(leftLength) + "|")
    setIndexPosition(leftLength)
    onChange(isAddIndex, leftLength, indexType)
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Typography.Title heading={6} style={{ margin: 8 }}>{t("indexReview.switch.title")}</Typography.Title>
        <Switch disabled={isDisable} onChange={(v) => {
          setIsAddIndex(v as boolean)
          onChange(v as boolean, indexPosition, indexType)
        }} />
      </div>
      <div hidden={!isAddIndex} style={{ top: "1rem" }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Select
            style={{ width: "100%" }}
            disabled={isDisable}
            onChange={(v) => {
              setIndexType(v as number)
              onChange(isAddIndex, indexPosition, v as number)
            }}
            insetLabel={t("indexReview.select.label")}
            defaultValue={IndexType.Number}
            clickToHide={true}
          >
            <Select.Option label={t("indexReview.select.option.number")} value={IndexType.Number} />
            <Select.Option label={t("indexReview.select.option.letters")} value={IndexType.Letters} />
            <Select.Option label={t("indexReview.select.option.chinese")} value={IndexType.Chinese} />
          </Select>
        </div>
        <Tooltip
          content={
            <span>{t("indexReview.tooltip.text1")}<br />{t("indexReview.tooltip.text2")}</span>
          }>
          <Tag style={{ width: "100%", height: "5rem", marginTop: "1rem" }}>
            <Card
              style={{ width: "100%", textAlign: "center" }}
            >
              <span
                style={{
                  textAlign: "center",
                }}>{indexReviewLeft}
              </span>
              <IconSmallTriangleDown style={{ color: "red" }} />
              <span
                style={{
                  textAlign: "center",
                }}>{indexReviewRight}
              </span>
            </Card></Tag>
        </Tooltip>
        <Slider
          // @ts-ignore
          tipFormatter={null}
          onChange={(v) => {
            setSliderValue(v as number)
            updateIndexRevew(v as number)
          }}
          disabled={isDisable}
        />
      </div>
    </div >

  )
}
async function EditFields(table: ITable, fieldId: string, onStart: () => void, onEnd: () => void, edit: (oldValue: string, index: number) => string) {
  if (fieldId === "") return
  onStart()
  const view = await table.getActiveView()
  const vRecords = await view.getVisibleRecordIdList()
  let field: IField<any, any, any>
  try {
    field = await table.getFieldById(fieldId)
  } catch (error) {
    Toast.error(`${useTranslation().t("function.EditFields.errorMsg1")}: ${fieldId}`)
    onEnd()
    return
  }
  let records = await field.getFieldValueList()
  let recordMap = new Map<string, string>()
  for (let i = 0; i < records.length; i++) {
    const id = records[i].record_id
    const value = (records[i].value as Array<IOpenSegment>)[0]
    if (id === undefined || value === undefined) continue
    recordMap.set(id, value.text)
  }
  let index = 0
  for (let i = 0; i < vRecords.length; i++) {
    const id = vRecords[i];
    if (id === undefined) continue
    const oldValue = recordMap.get(id)
    if (oldValue !== undefined) {
      const newValue = edit(oldValue, index)
      index += 1
      if (newValue === oldValue) continue
      field.setValue(id, newValue)
        .then((ok) => {
          if (!ok) {
            Toast.error(`${useTranslation().t("function.EditFields.errorMsg2")}: recordId: ${id} value: ${oldValue}`)
          }
        })
    }
  }
  onEnd()
}

function NumberToLetters(n: number): string {
  let result = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode('A'.charCodeAt(0) + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function NumberToChinese(n: number): string {
  const chineseNumerals = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const unitPosition = ['', '十', '百', '千'];

  const toChineseUnit = (num: number, unit: number): string => {
    const digit = chineseNumerals[num];
    const position = unitPosition[unit];
    return digit === '零' ? '' : digit + position;
  };

  const toChineseSegment = (num: number): string => {
    const segment = num.toString().split('').reverse();
    return segment
      .map((digit, index) => toChineseUnit(Number(digit), index))
      .reverse()
      .join('');
  };

  const toChinese = (num: number): string => {
    const segments = [];
    let remainder = num;

    while (remainder > 0) {
      const segment = remainder % 10000;
      segments.push(toChineseSegment(segment));
      remainder = Math.floor(remainder / 10000);
    }

    return segments
      .reverse()
      .map((segment, index) => (index === 0 ? segment : segment + '万'))
      .join('');
  };

  return toChinese(n);
}

function NumberToIndexString(index: number, indexType: number) {
  switch (indexType) {
    case IndexType.Letters:
      return NumberToLetters(index)
    case IndexType.Chinese:
      return NumberToChinese(index)
    default:
      return index.toString()
  }
}