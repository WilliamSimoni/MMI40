package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Chart extends SubElement {
	
	Props chartType;
	Props legend;
	Props data;

	public Chart(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		List<Class<?>> type2=new ArrayList<Class<?>>();
		type2.add(Boolean.class);
		List<Class<?>> type3=new ArrayList<Class<?>>();
		type3.add(Data.class);
		
		this.chartType=new Props(IdGenerator.getNextIdProps(), type, false, false,1);
		this.legend=new Props(IdGenerator.getNextIdProps(), type2, false, false,1);
		this.data=new Props(IdGenerator.getNextIdProps(), type3, false, false,1);
		this.props.put("chartType",chartType);
		this.props.put("legend",legend);
		this.props.put("data",data);
	}

}
