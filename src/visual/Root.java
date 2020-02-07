package visual;

import java.util.ArrayList;
import java.util.List;

import general.Element;
import general.IdGenerator;
import general.Props;
import general.Style;

public class Root extends Element {
	
	//props
	Props children;

	
	
	public Root(String id1) {
		super(id1);
		this.styleList=new ArrayList<Style>();
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(Page.class);
		this.children=new Props(IdGenerator.getNextIdProps(), type, false, false,-1);
		this.props.put("children", children);
	}
   
}
