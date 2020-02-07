package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Drawer extends SubElement {
	
	Props headerOpen;
	Props headerClosed;
	Props listOpen;
	Props listClosed;
	

	public Drawer(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(SubElement.class);
		List<Class<?>> type2=new ArrayList<Class<?>>();
		type2.add(Lists.class);
		
		this.headerOpen=new Props(IdGenerator.getNextIdProps(), type, false, false,1);
		this.headerClosed=new Props(IdGenerator.getNextIdProps(), type, false, false,1);
		this.listOpen=new Props(IdGenerator.getNextIdProps(), type2, false, false,1);
		this.listClosed=new Props(IdGenerator.getNextIdProps(), type2, false, false,1);
		
		this.props.put("headerOpen",headerOpen);
		this.props.put("headerClosed",headerClosed);
		this.props.put("listOpen",listOpen);
		this.props.put("listClosed",listClosed);
		
	}

}
