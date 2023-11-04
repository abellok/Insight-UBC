import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import axios from 'axios';
import {useState, useEffect} from 'react';
import TextField from "@mui/material/TextField";
import {Paper, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Table from "@mui/material/Table";

export default function Rooms() {
	const [rooms, setRooms] = useState([]);
	const [wantedRooms, setWantedRooms] = useState([]);
	const [value, setValue] = useState("");

	useEffect(() => {
		axios.get('http://localhost:4321/datasets')
			.then((res) => {
				setRooms((prevSections) => {
					console.log('Rooms:', res.data.result);
					return res.data.result;
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);


	const handleWantedRooms = async () => {
		const query = {
			WHERE: {
				GT: {
					"rooms_seats": parseInt(value)
				}
			},
			OPTIONS: {
				COLUMNS: [
					"myrooms_name",
					"myrooms_seats"
				],
				ORDER: "myrooms_seats"
			}
		};
		try {
			const response = await axios.post('http://localhost:4321/query', query);
			setWantedRooms((prevWantedRooms) => {
				console.log('Wanted Rooms:', response.data.result);
				return response.data.result;
			});
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div>
			<Typography>This tab can help you find rooms with capacities over a specified value.</Typography>
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
							{rooms.map((row) => (
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
				<Typography>Please put your desired minimum capacity in the text box below.</Typography>
			</div>
			<div>
				<TextField
					id="outlined-basic"
					label="Min Capacity"
					variant="outlined"
					margin="normal"
					value={value}
					onChange={event => setValue(event.target.value)}
					error={value === "" || !value.match("[0-9]+") || parseInt(value) < 0 || parseInt(value) === -0}
					helperText={value === "" ? 'No value inputted'
						: !value.match("[0-9]+") ? 'Must be numerical value'
							: parseInt(value) < 0 ? 'Value must be positive' :
								parseInt(value) === -0 ? 'Value must be positive' : " "}
				/>
			</div>
			<Button
				variant="contained"
				disabled={value === "" || !value.match("[0-9]+") || parseInt(value) < 0 || parseInt(value) === -0}
				onClick={handleWantedRooms}>Find Rooms
			</Button>
			<Typography>Resulting rooms will be listed below.</Typography>
			<Typography>(If no results show, then request has resulted in either 0 or >5000 results and will not compile)</Typography>
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Room Name</TableCell>
							<TableCell >Room Max Seats</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{wantedRooms.map((row) => (
							<TableRow
								key={row["myrooms_name"]}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									{row["myrooms_name"]}
								</TableCell>
								<TableCell>{row["myrooms_seats"]}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	)
}
