import { Button, Table, Typography, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './App.css';
import { useState } from 'react';
import * as XLSX from "xlsx";

const { Title } = Typography;
const { Dragger } = Upload;

interface RowData {
    [key: string]: any;
}

function App() {
    const [fileList, setFileList] = useState<Array<any>>([]);

    const [tableData, setTableData] = useState<Array<RowData> | undefined>(undefined);


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
        const groupedData: { [key: string]: { totalAmount: number, totalSell: number } } = {};
    
        data.forEach((row) => {
            const supplierCode = row['Артикул поставщика'];
            const amount = typeof row['Кол-во'] === "number" ? parseFloat(row['Кол-во'].toString()) : 0;
    
            if (groupedData[supplierCode]) {
                groupedData[supplierCode].totalAmount += amount;
    
                if (
                    typeof row['Вайлдберриз реализовал Товар (Пр)'] === "number" &&
                    typeof row['Тип документа'] === "string"
                ) {
                    if (row['Тип документа'] === "Продажа") {
                        groupedData[supplierCode].totalSell += parseFloat(row['Вайлдберриз реализовал Товар (Пр)'].toString());
                    } else if (row['Тип документа'] === "Возврат") {
                        groupedData[supplierCode].totalSell -= parseFloat(row['Вайлдберриз реализовал Товар (Пр)'].toString());
                    }
                }
            } else {
                groupedData[supplierCode] = {
                    totalAmount: amount,
                    totalSell: 0
                };
    
                if (
                    typeof row['Вайлдберриз реализовал Товар (Пр)'] === "number" &&
                    typeof row['Тип документа'] === "string" &&
                    row['Тип документа'] === "Продажа"
                ) {
                    groupedData[supplierCode].totalSell = parseFloat(row['Вайлдберриз реализовал Товар (Пр)'].toString());
                }
            }
        });
    
        const tableRows = Object.keys(groupedData).map(supplierCode => ({
            supplierCode,
            totalAmount: groupedData[supplierCode].totalAmount,
            totalSell: groupedData[supplierCode].totalSell
        }));

        // Установка данных для таблицы
        setTableData(tableRows);
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

    const columns = [
        {
            title: 'Артикул поставщика',
            dataIndex: 'supplierCode',
            key: 'supplierCode',
        },
        {
            title: 'Общее количество',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
        },
        {
            title: 'Продажа',
            dataIndex: 'totalSell',
            key: 'totalSell',
        },
    ];

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
                     <div style={{ marginTop: 20 }}>
                        {
                            tableData && (
                                <Table columns={columns} dataSource={tableData} pagination={false}/>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
