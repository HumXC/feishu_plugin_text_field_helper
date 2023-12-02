import { Button, Row, Col, Radio, RadioGroup } from '@douyinfe/semi-ui';
import React, { CSSProperties, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { IconTriangleUp, IconTriangleDown, IconRadio } from '@douyinfe/semi-icons';
const containerStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "60% 10px 40%",
    width: '100%',  // 调整 container 的宽度
    height: '200px',  // 调整 container 的高度
};

const review: CSSProperties = {
    gridColumn: '1',
    backgroundColor: 'blue',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
}

const selector: CSSProperties = {
    gridColumn: '3',
    height: "100%",
    width: "100%",
    display: "grid",
    alignItems: "center"
}
const Selector: React.FC<{ items: Array<string>, onChange?: (type: "up" | "all" | "down") => void }> = ({ onChange = null, items = [] }) => {
    const [type, setType] = useState<"up" | "all" | "down">("all")
    const changeType = (val: number) => {
        let _type: "up" | "all" | "down" = "all"
        switch (val) {
            case 1:
                setType("up")
                _type = "up"
                break
            case 3:
                setType("down")
                _type = "down"
                break
            default:
                setType("all")
                _type = "all"
                break
        }
        if (onChange) { onChange(_type) }
    }

    return (
        <div style={containerStyle}>
            <div style={review}>
                {type === "all" ? <ReviewItem /> : null}
                {type === "all" ? <ReviewItem /> : null}
                {type === "up" ? <ReviewItem /> : null}
                {type === "up" ? <ReviewItem /> : null}
                {items.map((text, _) => (
                    <ReviewItem text={text} />
                ))}
                {items.length === 0 ? <ReviewItem /> : null}
                {items.length === 0 && type !== "all" ? <ReviewItem /> : null}
                {items.length === 0 && type !== "all" ? <ReviewItem /> : null}
                {type === "all" ? <ReviewItem /> : null}
                {type === "all" ? <ReviewItem /> : null}
                {type === "down" ? <ReviewItem /> : null}
                {type === "down" ? <ReviewItem /> : null}
            </div>
            <div style={selector}>
                <RadioGroup onChange={(e) => { changeType(e.target.value) }} type="pureCard" direction="vertical" defaultValue={2}>
                    <Radio value={1} > <IconTriangleUp /> <div style={{ width: "10px" }} />以上</Radio>
                    <Radio value={2}><IconRadio /> <div style={{ width: "10px" }} />整列</Radio>
                    <Radio value={3}><IconTriangleDown /> <div style={{ width: "10px" }} />以下</Radio>
                </RadioGroup>
            </div>
        </div>
    );
}

const revireItem: CSSProperties = {
    width: "90%",
    height: "30px",
    backgroundColor: "ThreeDFace",
    textAlign: "center",
    border: "2px solid",
}

const ReviewItem: React.FC<{ text?: string }> = ({ text = "..." }) => {
    return (
        <div style={revireItem}>
            <p style={{
                border: "1px solid #ddd",
                margin: "6px",
                fontSize: "14px"
            }}>{text}</p>
        </div>
    )
}

export default Selector