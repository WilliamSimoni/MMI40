package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Scaffold extends SubElement {
	
	Props topNavBar;
	Props botNavBar;
	Props drawer;
	Props body;

	public Scaffold(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(TopNavigationBar.class);
		List<Class<?>> type2=new ArrayList<Class<?>>();
		type2.add(BottomNavigationBar.class);
		List<Class<?>> type3=new ArrayList<Class<?>>();
		type3.add(Drawer.class);
		List<Class<?>> type4=new ArrayList<Class<?>>();
		type4.add(SubElement.class);
		
		
		this.topNavBar=new Props(IdGenerator.getNextIdProps(),
				                                   type, true, true,1);
		this.botNavBar=new Props(IdGenerator.getNextIdProps(),
                type2, true, true,1);
		this.drawer=new Props(IdGenerator.getNextIdProps(),
                type3, true, true,1);
		
		this.body=new Props(IdGenerator.getNextIdProps(), type4, true, true,1);
		this.props.put("body",body);
		this.props.put("body",drawer);
		this.props.put("botNavBar",botNavBar);
		this.props.put("topNavBar",topNavBar);
	}

}
