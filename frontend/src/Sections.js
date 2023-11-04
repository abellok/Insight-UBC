import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import {useState, useEffect} from 'react';
import Table from '@mui/material/Table';
import {Paper, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

export default function Sections() {
	const [sections, setSections] = useState([]);
	const [wantedSections, setWantedSections] = useState([]);
	const [value, setValue] = useState("");

	// useEffect(() => {
	// 	axios.get('http://localhost:4321/datasets').then((res) => {
	// 		console.log('The following console log is res.data.result');
	// 		console.log(res.data.result);
	// 		setSections(res.data.result);
	// 		console.log('This is typeof sections: ' + (typeof sections));
	// 		console.log('The following console log is sections:');
	// 		console.log(sections);
	// 	}).catch((err) => {
	// 		console.log(err);
	// 	});
	// }, []);
	useEffect(() => {
		axios.get('http://localhost:4321/datasets')
			.then((res) => {
				setSections((prevSections) => {
					console.log('Sections:', res.data.result);
					return res.data.result;
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	// const handleWantedSections = async () => {
	// 	const query = {
	// 		WHERE: {
	// 			GT: {
	// 				sections_avg: 97
	// 			}
	// 		},
	// 		OPTIONS: {
	// 			COLUMNS: [
	// 				"mysections_dept",
	// 				"mysections_avg"
	// 			],
	// 			ORDER: "mysections_avg"
	// 		}
	// 	}
	// 	try {
	// 		const response = await axios.post('http://localhost:4321/query', query);
	// 		console.log("This is the query response:");
	// 		console.log(response);
	// 		setWantedSections(response.data.result);
	// 		console.log("This is wanted sections:");
	// 		console.log(wantedSections)
	// 	} catch (err) {
	// 		console.log(err);
	// 	}
	// }
	const handleWantedSections = async () => {
		const query = {
			WHERE: {
				GT: {
					sections_avg: parseFloat(value)
				}
			},
			OPTIONS: {
				COLUMNS: [
					"mysections_dept",
					"mysections_id",
					"mysections_avg"
				],
				ORDER: "mysections_avg"
			}
		};
		try {
			const response = await axios.post('http://localhost:4321/query', query);
			setWantedSections((prevWantedSections) => {
				console.log('Wanted Sections:', response.data.result);
				return response.data.result;
			});
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div>
			<Typography>This tab can help you find courses with averages over a specified value.</Typography>
			<div>
				<Typography>Currently uploaded datasets:</Typography>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Dataset ID</TableCell>
								<TableCell >Dataset Kind</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{sections.map((row) => (
								<TableRow
									key={row["id"]}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<TableCell component="th" scope="row">
										{row["id"]}
									</TableCell>
									<TableCell>{row["kind"]}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
			<div>
				<Typography>Please put your desired minimum average in the text box below.</Typography>
			</div>
			<div>
				<TextField
					id="outlined-basic"
					label="MinAverage"
					variant="outlined"
					margin="normal"
					value={value}
					onChange={event => setValue(event.target.value)}
					error={value === "" || !value.match("[0-9]+") || parseFloat(value) < 0 || parseFloat(value) >= 100
				|| parseFloat(value) === -0}
					helperText={value === "" ? 'No value inputted'
						: !value.match("[0-9]+") ? 'Must be numerical value'
							: parseFloat(value) < 0 ? 'Value must be positive' :
								parseFloat(value) >= 100 ? '100 is the maximum' :
									parseFloat(value) === -0 ? 'Value must be positive' : ' '}
				/>
			</div>
			<Button
				variant="contained"
				disabled={value === "" || !value.match("[0-9]+") || parseFloat(value) < 0 || parseFloat(value) >= 100
				|| parseFloat(value) === -0}
				onClick={handleWantedSections}>Find Courses
			</Button>
			<Typography>Resulting courses will be listed below.</Typography>
			<Typography>(If no results show, then request has resulted in either 0 or >5000 results and will not compile)</Typography>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Course Section</TableCell>
							<TableCell >Section Avg</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{wantedSections.map((row) => (
							<TableRow
								key={row["mysections_uuid"]}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row" sx={{ textTransform: "uppercase" }}>
									{`${row["mysections_dept"]}_${row["mysections_id"]}`}
								</TableCell>
								<TableCell>{row["mysections_avg"]}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	)
};

