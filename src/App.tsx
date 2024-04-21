import { Button, Typography, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './App.css';
import { useState } from 'react';
import * as XLSX from "xlsx";

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;

interface RowData {
    [key: string]: any;
}

interface IResult {
    totalAmount: number;
    totalSell: number;
}

function App() {
    const [fileList, setFileList] = useState<Array<any>>([]);
    const [result, setResult] = useState<IResult>({
        totalAmount: 0,
        totalSell: 0
    });

    const handleConvert = () => {
        if (fileList.length > 0) {
            const file = fileList[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result;
                if (typeof data === "string") {
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json<RowData>(worksheet);
                    calculate(json);
                }
            };
            reader.readAsBinaryString(file.originFileObj);
        }
    };

    const calculate = (data: RowData[]) => {
        let totalAmount = 0;
        let totalSell = 0;

        data.forEach((row) => {
            if (typeof row['Кол-во'] === "number") {
                totalAmount += parseFloat(row['Кол-во'].toString());
            }

            if (
                typeof row['Вайлдберриз реализовал Товар (Пр)'] === "number" &&
                typeof row['Тип документа'] === "string"
            ) {
                if (row['Тип документа'] === "Продажа") {
                    totalSell += parseFloat(row['Вайлдберриз реализовал Товар (Пр)'].toString());
                } else if (row['Тип документа'] === "Возврат") {
                    totalSell -= parseFloat(row['Вайлдберриз реализовал Товар (Пр)'].toString());
                }
            }
        });

        setResult({
            totalAmount: totalAmount,
            totalSell: totalSell
        });
    };

    const customRequest = (option: any) => {
        const file = option.file;
        setFileList([{
            uid: '-1',
            name: file.name,
            status: 'done',
            url: URL.createObjectURL(file),
            originFileObj: file,
        }]);
    };

    return (
        <>
            <div>
                <Title level={3}>Загрузите файл в формате xls,xlsx</Title>
                <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                    <Dragger
                        accept=".xls,.xlsx"
                        fileList={fileList}
                        customRequest={customRequest}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Нажмите или перетащите файл для загрузки</p>
                        <p className="ant-upload-hint">Поддерживается только формат xls и xlsx</p>
                    </Dragger>
                    <Button size='large' type='primary' onClick={handleConvert}>Получить результат</Button>
                    {
                        result.totalAmount > 0 && (
                            <>
                                <Title level={4}>
                                    Результаты
                                </Title>
                                <Paragraph>
                                    Общее количество: <Text strong>{result.totalAmount}</Text>
                                </Paragraph>
                                <Paragraph>
                                    Продажа: <Text strong>{result.totalSell}</Text>
                                </Paragraph>
                            </>
                        )
                    }
                </div>
            </div>
        </>
    );
}

export default App;
